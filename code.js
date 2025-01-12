const baseUrl = "https://www.goodreads.com";
const statusUrl = baseUrl + "/user_status/list/";

function getData(url, extraOptions)
{
    const options = {
        "muteHttpExceptions": true,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0"
        },
        ...extraOptions
    };

    return UrlFetchApp.fetch(url, options).getContentText();
}

function getElementText(element)
{
    return element.getValue().trim();
}

function convertDateFromPage(element)
{
    // Example: "Oct 24, 2016 12:26PM" -> "2016-10-24T12:26:00Z"
    const dateStr = getElementText(element);
    const dateObj = Utilities.parseDate(dateStr, Session.getScriptTimeZone(),
        "MMM dd, yyyy hh:mmaa");
    return dateObj.toISOString();
}

function extractStatusFromElement(element)
{
    var status = {};

    // The Goodreads statuses page returns status information in the following format:
    //
    // <USER PHOTO>
    // <CONTENT>
    // <BOOK COVER>
    // <br/>

    var content = xmlcommon.find(element, 'div', 'class', ['left']);
    // This retrieves an element that should be structured as follows:
    // <div class="left" style="float: left; width: 495px;">
    //
    //   <span class="uitext greyText inlineblock stacked user_status_header">
    //     <a href="/user/show/1234-johnsmith">John Smith</a>
    //     is on page 18 of 216 of <a href="https://www.goodreads.com/book/show/11.The_Hitchhiker_s_Guide_to_the_Galaxy" rel="nofollow">The Hitchhiker's Guide to the Galaxy</a>
    //   </span>
    //
    //   <div class="readable body">
    //     I like reading!
    //   </div>
    //
    //   <span class="greyText uitext smallText">
    //     — <a class="greyText" href="/user_status/show/12402">Sep 06, 2008 05:25AM</a>
    //   </span>
    //   <a class="right actionLink" href="/user_status/show/12402">1 comment</a>
    //
    // </div>

    status.status = getElementText(
        xmlcommon.find(content, 'div', 'class', ['readable', 'body']));

    // Extract the date and status id
    var dateIdElement = xmlcommon.find(
        xmlcommon.find(content, 'span', 'class', ['greyText', 'uitext', 'smallText']), 'a');
    if (dateIdElement)
    {
        status.date = convertDateFromPage(dateIdElement);
        status.statusId = xmlcommon.getAttributeValue(dateIdElement, 'href').split('/').pop();
    }

    // Extract book info (e.g., title, id)
    var progressElement = xmlcommon.find(content, 'span', 'class', ['user_status_header']);
    var bookTitleLink = xmlcommon.find(progressElement, 'a', 'rel', ['nofollow']);
    if (bookTitleLink)
    {
        status.bookTitle = getElementText(bookTitleLink);
        status.bookId = xmlcommon.getAttributeValue(bookTitleLink, 'href').split('/').pop().split('.')[0];

        // Extract progress (page or percentage)
        var progressText = getElementText(progressElement);
        var progressValues = progressText.match(/.* is (?:on page )?(\d*%?) (?:of (\d*) of|done with) .*/);

        if (progressValues)
        {
            if (progressValues[1].endsWith('%'))
            {
                status.percentage = parseInt(progressValues[1].slice(0, -1));
            } else
            {
                status.pageNo = parseInt(progressValues[1]);
                status.totalPages = parseInt(progressValues[2]);
                status.percentage = Math.floor((status.pageNo / status.totalPages) * 100);
            }
        }
        else if (progressText.includes('finished'))
        {
            status.percentage = 100;
        } else
        {
            status.percentage = 0;
        }
    }

    return status;
}

function getStatuses(userId)
{
    // Get an initial page, so we know how many pages there are to get
    const url = statusUrl + userId + '?page=';
    var pageNo = 1;
    var response = getData(url + pageNo);

    // The status count should be at the top of the page in this format:
    // "Showing 1-30 of 123"
    const pageCountText = response.match(/Showing \d+-(\d+) of (\d+)/);
    const pageStatusCount = parseInt(pageCountText[1]);
    const totalStatusCount = parseInt(pageCountText[2]);
    const pageCount = Math.ceil(totalStatusCount / pageStatusCount);

    var statuses = [];
    for (pageNo = 1; pageNo < pageCount; pageNo++)
    {
        response = getData(url + pageNo);

        // Retrieve the whole list of statuses on this page
        const pattern =
            /<form.* action=\"\/user_status\/delete_checked_user_statuses\"([\w\W]+?)<\/form>/gm;
        var pageStatuses = response.match(pattern);

        // Remove characters/entities GAS XmlService can't handle
        pageStatuses = pageStatuses[0].replaceAll("&mdash;", "");

        // Extract all statuses from this page
        var doc = XmlService.parse(pageStatuses).getRootElement();
        var statusElements = doc.getChildren("div");

        // Extract the data from each status
        statusElements.forEach(function(element)
        {
            statuses.push(extractStatusFromElement(element));
        });
    }

    return statuses;
}

function main()
{
    var statuses = getStatuses(config.userId);

    // Save as a json file in the indicated Google Drive folder
    var jsonStr = JSON.stringify(statuses, null, 4);
    var file = common.updateOrCreateFile(config.backupDir,
        "goodreads_statuses.json", jsonStr);
}
