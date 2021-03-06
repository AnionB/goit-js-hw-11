import axios from 'axios';
export { getPictures, makeUrl };

async function getPictures(searchQuery, currentPage) {
  try {
    return await (
      await makeQuery(searchQuery, currentPage)
    ).data;
  } catch {
    error => console.log('something wrong' + error);
  }
}

function makeQuery(searchQuery, page) {
  return axios.get(makeUrl(searchQuery, page));
}

function makeUrl(searchQuery, page) {
  const key = '25645547-d70858bec2d16a14b7d60bc29';
  const image_type = 'photo';
  const orientation = 'horizontal';
  const safesearch = 'true';
  const per_page = 40;
  const url = `https://pixabay.com/api/?key=${key}&q=${searchQuery}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}&per_page=${per_page}&page=${page}`;
  return url;
}
