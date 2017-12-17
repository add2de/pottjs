class MemeViewer {
	constructor() {
		this.entries = []

		let filter = document.querySelector('#filter');
		filter.addEventListener('submit', (e) => {
			e.preventDefault();

			let formData = new FormData(filter),
				subreddit = formData.get('subreddit'),
				category = formData.get('category');
			let limit = formData.get('limit');

			this.showNFSW = !!formData.get('nsfw')
			this.showStickied = !!formData.get('stickied')

			this.load(subreddit, category, limit);
		});

		let sort = document.querySelector('#sort');
		sort.addEventListener('change', (e) => {
			this.entries = this.sort(this.entries, document.querySelector('input[name="sort"]:checked').value);
			this.updateDOM(this.entries)
		});

		this.load('memes', 'hot', '15');
	}

	load(sub, cat, limit) {
		fetch(`https://www.reddit.com/r/${sub}/${cat}.json?g=GLOBAL&limit=${limit}`)
			.then(response => response.json()).then((json) => {
			this.entries = json.data.children;
			this.entries = this.sort(this.entries, 'ups');
			this.updateDOM(this.entries);
		})
	}

	updateDOM(entries) {
		let container = document.querySelector('#container');
		let oldEntries = container.querySelectorAll('.entry');

		oldEntries.forEach(function (entry) {
			container.removeChild(entry);
		});

		entries
			.filter(this.isEntryShown.bind(this))
			.forEach(function (t) {
				let entry = document.createElement('a');
				entry.classList.add('entry');
				entry.href = t.data.url;
				entry.target = "_blank";
				entry.setAttribute('data-score', t.data.score);
				entry.setAttribute('data-ups', t.data.ups);
				entry.setAttribute('data-created', t.data.created);

				let figure = document.createElement('figure');
				figure.href = t.data.url;
				figure.target = "_blank";

				let thumbnail = document.createElement('img');
				thumbnail.src = t.data.thumbnail;
				figure.appendChild(thumbnail);

				let title = document.createElement('figcaption');
				title.innerHTML = t.data.title;
				figure.appendChild(title);

				container.appendChild(entry).appendChild(figure);
			})
	}

	sort(entries, sortBy) {
		return entries.slice().sort((a, b) => {
			const contentA = a.data[sortBy]
			const contentB = b.data[sortBy]
			return contentB - contentA
		})
	};

	isEntryShown(entry) {
		let hasThumbnail = entry.data.thumbnail !== '' && entry.data.thumbnail !== 'self'
		let isNFSW = entry.data.over_18
		let isStickied = entry.data.stickied

		return hasThumbnail && (this.showNFSW ? true : !isNFSW) && (this.showStickied ? true : !isStickied)
	}
}