function shuffleList(v){
		for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
		return v;
};

function randomDateRecent() {
	return new Date(Date.now() - Math.random()*5000000000);
}

function randomDateFuture() {
	return new Date(Date.now() + Math.random()*5000000000);
}

function randomListItem(l) {
	return l[Math.floor(Math.random()*l.length)];
}

module.exports = {
	shuffle: shuffleList,
	recentDate: randomDateRecent,
	futureDate: randomDateFuture,
	listItem: randomListItem
};