const container = document.getElementById('root');
const ajax = new XMLHttpRequest(); // ajax 란?
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'
const store = {
  currentPage: 1,
};

const getData = (url) => {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
};

const newsFeed = () => {
  const newsFeed = getData(NEWS_URL);
  const newsList = [];
  let template = `
    <div class = "container mx-auto p-4">
      <h1>Hacker News</h1>
      <ul>
        {{__news_feed__}}
      </ul>
      <div>
        <a href='#/page/{{__prev_page__}}'>이전 페이지</a>
        <a href='#/page/{{__next_page__}}'>다음 페이지</a>
      </div>
    </div>
  `;

  // newsList.push('<ul>');

  for(let i = (store.currentPage - 1)*10 ; i < store.currentPage * 10; i++) {
    const news =`
    <li>
      <a href="#${newsFeed[i].id}">
      ${newsFeed[i].title} (${newsFeed[i].comments_count})
      </a>
    </li>
    `;
    newsList.push(news);
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1);
  template = template.replace('{{__next_page__}}', store.currentPage + 1);

  // console.log(newsFeed.length / 10);
  // const max_page = newsFeed.length / 10

  // newsList.push('</ul>');
  // newsList.push(`
  //   <div>
  //     <a href="#/page/${store.currentPage > 1 ? store.currentPage - 1 : 1}">이전 페이지</a>
  //     <a href="#/page/${store.currentPage + 1}">다음 페이지</a>
  //   </div>
  // `);
  container.innerHTML = template;
};

const newsDetail = () => {
  const id = location.hash.substring(1);
  const newsContent = getData(CONTENT_URL.replace('@id', id));

  container.innerHTML = `
    <h1>${newsContent.title}</h1>

    <div>
      <a href="#/page/${store.currentPage}">목록으로</a>
    </div>
  `;
};

// router
const router = () => {
  const routerPath = location.hash;

  if (routerPath === '') {
    newsFeed();
  } else if (routerPath.indexOf(('#/page/')) >= 0) {
    store.currentPage = Number(routerPath.substring(7));
    console.log(store.currentPage);
    newsFeed();
  } else {
    newsDetail();
  }
};

window.addEventListener('hashchange', router);

router();