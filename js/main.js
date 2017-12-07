const $ = (...args) => {
    const results = Array.from(document.querySelectorAll(args));
    return results.length == 1 ? results[0] : results;
};

class MemeViewer {

    constructor () {

        this.allow_nsfw = $("#allow_nsfw");
        this.allow_sticky = $("#allow_sticky");

        this.sortBy = "score";
        console.log("loaded");
        const filter = $("#filter");
        filter.addEventListener("submit", e => {
            const formData = new FormData(filter);
            this.getJSON(formData.get("subreddit"), formData.get("category"), formData.get("limit"));
            // if left out you get some search params into the url and can reload more easily
            //e.preventDefault();
        });

        const sort = $("#sort");
        sort.addEventListener("click", e =>  {
            if (e.target.value == undefined) return;
            this.sortBy = sort.querySelector("input[name='sort']:checked").value;
            this.sort();
        });

        this.getJSON("memes", "hot", "15");
    }

    async getJSON (sub, cat, limit) {
        const res = await fetch(`https://www.reddit.com/r/${sub}/${cat}.json?${this.toQueryString({ g: "GLOBAL", limit })}`);
        const data = await res.json();
        this.buildList(data.data.children);
    }

    buildList (entries) {
        const container = $("#container");
        
        //const oldEntries = container.querySelectorAll(".entry");
        container.innerHTML = "";

        entries.forEach(entry => {
            if (entry.data.thumbnail === "" || entry.data.thumbnail == "self") return;
            if (!this.allow_nsfw.checked && entry.data.over_18) return;
            if (!this.allow_sticky.checked && entry.data.stickied) return;

            const entryEl = document.createElement('a');
            entryEl.classList.add('entry');
            entryEl.href = entry.data.url;
            entryEl.target = "_blank";
            entryEl.setAttribute('data-score', entry.data.score);
            entryEl.setAttribute('data-ups', entry.data.ups);
            entryEl.setAttribute('data-downs', entry.data.downs);
            entryEl.setAttribute('data-created', entry.data.created);

            const figure = document.createElement('figure');
            figure.href = entry.data.url;
            figure.target = "_blank";

            const thumbnail = document.createElement('img');
            thumbnail.src = entry.data.thumbnail;
            figure.appendChild(thumbnail);

            const title = document.createElement('figcaption');
            title.innerHTML = entry.data.title;
            figure.appendChild(title);

            container.appendChild(entryEl).appendChild(figure);

        });

    }

    sort (sortBy = this.sortBy) {
        const container = $("#container");
        const entries = Array.from(container.querySelectorAll(".entry"));

        entries.sort((a, b) => {
            return (a.dataset[sortBy] - 0) < (b.dataset[sortBy] - 0) ? 1 : -1;
        });

        entries.forEach(entry => container.append(entry));
    }

    toQueryString (obj) {
        return Object.entries(obj).map(([k, v]) => `${encodeURI(k)}=${encodeURI(v)}`).join("&");
    }

}

document.addEventListener("DOMContentLoaded", () => new MemeViewer());

/*

const sort = (sortBy) => (entries) => entries.sort((a, b) => a.dataset[sortBy]-0 < b.dataset[sortBy] ? 1 : -1);
const toQueryString = obj => Object.entries(obj).map(([k, v]) => `${encodeURI(k)}=${encodeURI(v)}`).join("&");

const getJSON = (url) => fetch(url)
    .then(res => res.json())
    .then(json => json.data.children);

const toElements = (entries) => entries.map(entry => {
    if (entry.data.thumbnail === "" || entry.data.thumbnail == "self") return;
    if (entry.data.over_18) return;
    if (entry.data.stickied) return;

    const entryEl = document.createElement('a');
    entryEl.classList.add('entry');
    entryEl.href = entry.data.url;
    entryEl.target = "_blank";
    entryEl.setAttribute('data-score', entry.data.score);
    entryEl.setAttribute('data-ups', entry.data.ups);
    entryEl.setAttribute('data-downs', entry.data.downs);
    entryEl.setAttribute('data-created', entry.data.created);

    const figure = document.createElement('figure');
    figure.href = entry.data.url;
    figure.target = "_blank";

    const thumbnail = document.createElement('img');
    thumbnail.src = entry.data.thumbnail;
    figure.appendChild(thumbnail);

    const title = document.createElement('figcaption');
    title.innerHTML = entry.data.title;
    figure.appendChild(title);

    entryEl.appendChild(figure);

    return entryEl;
});

const appendTo = (el) => (entries) => (el.innerHTML = "") || entries.forEach(entry => el.appendChild(entry));

document.addEventListener("DOMContentLoaded", () => {

    const load = (sub = "memes", cat = "hot", limit = 15) => getJSON(`https://www.reddit.com/r/${sub}/${cat}.json?${toQueryString({ g: "GLOBAL", limit })}`)
        .then(toElements)
        .then(sort(($("#sort input[name='sort']:checked") || { value: "score" }).value))
        .then(appendTo($("#container")))
        .catch(console.log);

    const filter = $("#filter");
    filter.addEventListener("submit", e => {
        e.preventDefault();
        const formData = new FormData(filter);
        load(formData.get("subreddit"), formData.get("category"), formData.get("limit"));
    });

    $("#sort").addEventListener("click", e =>  {
        if (e.target.value == undefined) return;
        load();
    });
    
    load();
});

*/