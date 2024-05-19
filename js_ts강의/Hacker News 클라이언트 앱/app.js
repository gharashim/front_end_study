const ajax = new XMLHttpRequest(); // ajax 란?
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'


ajax.open('GET', NEWS_URL, false);
ajax.send();

// console.log(ajax.response);

const newsFeed = JSON.parse(ajax.response);
// console.log(newsFeed);

const ul = document.createElement('ul');

for(let i = 0; i < newsFeed.length; i++) {
  const li = document.createElement('li');
  li.innerHTML = newsFeed[i].title
  // const li2 = document.createElement('li');
  // li.innerHTML = newsFeed[i].title
  // li2.innerHTML = newsFeed[i].url
  // li.appendChild(li2);
  ul.appendChild(li);
  
}

document.getElementById('root').appendChild(ul);