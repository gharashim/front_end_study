type Store = {
  currentPage: number;
  feeds: NewsFeed[];
}

type News = {
  id: number;
  time_ago: string;
  title: string;
  url: string;
  user: string;
  content: string;
}

type NewsFeed = News & {
  comments_count: number;
  points: number;
  read?: boolean; // ?의 뜻은???
}

type NewsDetail = News & {
  comments: NewsComment[];
}

type NewsComment = News &{
  comments: NewsComment[];
  level: number; // 댓글, 대댓글, 대대댓글 확인을 위한 depth
}

const container: HTMLElement | null = document.getElementById('root');
const ajax:XMLHttpRequest = new XMLHttpRequest(); // ajax 란?
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'
const store: Store = {
  currentPage: 1,
  feeds: [],
};

// const getData = <T>(url: string): NewsFeed[] | newsDetail => {
const getData = <AjaxResponse>(url: string): AjaxResponse => { // getData 함수는 return 값 종류가 2개 이다... -> 제너릭을 사용
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
};

const makeFeeds = (feeds: NewsFeed[]): NewsFeed[] => {
  for (let i = 0 ; i < feeds.length; i++) { // i -> 타입 추론
    feeds[i].read = false;
  }

  return feeds;
}

const updateView = (html: string): void => {
  if (container != null) {
    container.innerHTML = html;
  } else {
    console.log("최상위 container 가 없습니다.")
  }
}

const newsFeed = (): void => {
  let newsFeed: NewsFeed[] = store.feeds;
  const newsList = [];
  let template = `
    <div class = "bg-gray-600 min-h-screen">
      <div class = "bg-white text-xl">
        <div class = "mx-auto px -4">
          <div class = "flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href='#/page/{{__prev_page__}}'>
                Previous
              </a>
              <a href='#/page/{{__next_page__}}'>
                Next
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news_feed__}}
      </div>
    </div>
  `;

  if (newsFeed.length == 0) {
    newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL));
  }

  for(let i = (store.currentPage - 1)*10 ; i < store.currentPage * 10; i++) {
    const news =`
    <div class="p-6 ${newsFeed[i].read ? 'bg-gray-500' : 'bg-white'}  mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
      <div class="flex">
        <div class="flex-auto">
          <a href="#${newsFeed[i].id}">${newsFeed[i].title}</a>
        </div>
        <div class="text-center text-sm">
          <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
        </div>
      </div>
      <div class="flex mt-3">
        <div class = "grid grid-cols-3 text-sm text-gray-500">
        <div class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
        <div class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
        <div class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
        </div>
      </div>
    </div>
    `;
    newsList.push(news);
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
  template = template.replace('{{__next_page__}}', String(store.currentPage + 1));

  // if (container != null) {
  //   container.innerHTML = template;
  // } else {
  //   console.log("최상위 container 가 없습니다.")
  // }
  updateView(template);
};

const newsDetail = () => {
  const id = location.hash.substring(1);
  const newsContent = getData<NewsDetail>(CONTENT_URL.replace('@id', id));

  let template = `
  <div class="bg-gray-600 min-h-screen pb-8">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between itesm-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/${store.currentPage}" class="text-gray-500">
              <i class="fa fa-times"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="h-full border rounded-xl bg-white m-6 p-4">
      <h2>${newsContent.title}</h2>
      <div class="text-gray-400 h-20">
        ${newsContent.content}
      </div>
      {{__comments__}}
    </div>
  </div>
  `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id == Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  const makeComment = (comments: NewsComment[]): string => {
    const commentString = [];

    for(let i = 0; i < comments.length; i++) {
      const comment: NewsComment = comments[i];
      commentString.push(`
        <div style="padding-left: ${20 + comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>
      `);

      if(comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments));
      }
    }

    return commentString.join('');
  }

  // if (container != null) {
  //   container.innerHTML = template.replace(`{{__comments__}}`, makeComment(newsContent.comments));
  // } else {
  //   console.log("최상위 container 가 없습니다.")
  // }
  updateView(template.replace(`{{__comments__}}`, makeComment(newsContent.comments)));
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