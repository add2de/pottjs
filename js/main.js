var data = {},
    filter,
    loadedEntries = null;

var sortBy = function (sortByKeyword) {
    loadedEntries.sort(function(a, b) {
        var contentA;
        var contentB;

        if (sortByKeyword == 'ups') {
            contentA = a.data.ups;
            contentB = b.data.ups;
        } else if (sortByKeyword == 'downs') {
            contentA = a.data.downs;
            contentB = b.data.downs;
        } else if (sortByKeyword == 'age') {
            contentA = a.data.created;
            contentB = b.data.created;
        }

        return (contentA < contentB) ? -1 : 1;
    });
};

var buildList = function () {
    var container = document.querySelector('#container');
    container.innerHTML = '';

    loadedEntries.forEach(function (t) {
        if(t.data.thumbnail == '' || t.data.thumbnail == 'self' ) return;
        if(t.data.over_18) return;
        if(t.data.stickied) return;

        var entry = document.createElement('a');
        entry.classList.add('entry');
        entry.href = t.data.url;
        entry.target = "_blank";
        entry.setAttribute('data-score', t.data.score);
        entry.setAttribute('data-ups', t.data.ups);
        entry.setAttribute('data-downs', t.data.downs);
        entry.setAttribute('data-created', t.data.created);

        var figure = document.createElement('figure');
        figure.href = t.data.url;
        figure.target = "_blank";

        var thumbnail = document.createElement('img');
        thumbnail.src = t.data.thumbnail;
        figure.appendChild(thumbnail);

        var title = document.createElement('figcaption');
        title.innerHTML = t.data.title;
        figure.appendChild(title);

        container.appendChild(entry).appendChild(figure);
    });

};

var handleOnLoad = function (res) {
    loadedEntries = res.target.response.data.children;

    sortBy('ups');
    buildList();
};

var getJSON = function(sub, cat, limit) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onload = handleOnLoad;
    httpRequest.responseType = 'json';
    httpRequest.open(
        'GET',
        'https://www.reddit.com/r/'+sub+'/'+cat+'.json?g=GLOBAL&limit=' + limit +'',
        true
    );
    httpRequest.send();
};

var init = function() {
    var filter = document.querySelector('#filter');
    filter.addEventListener('submit', function(e)  {
        var formData = new FormData(filter),
            subreddit = formData.get('subreddit'),
            category = formData.get('category');
            limit = formData.get('limit');

        getJSON(subreddit, category, limit);
        e.preventDefault();
    });

    document.querySelector('#sort').addEventListener('click', function(e)  {
        var sortByCriteria = this.querySelector('input[name="sort"]:checked');
        if (sortByCriteria && sortByCriteria.value) {
            sortBy(sortByCriteria.value);
            buildList();
        }
    });

    getJSON('memes', 'hot', '15');
};

if (document.readyState !== 'loading') {
    init();
} else {
    // the document hasn't finished loading/parsing yet so let's add an event handler
    document.addEventListener('DOMContentLoaded', init);
}
