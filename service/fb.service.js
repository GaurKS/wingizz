// make an axios call wrapper
const axios = require('axios');

const axiosRequest = async (method, url, data, headers) => {
  const response = await axios({
    method,
    url,
    data,
    headers
  });
  return response.data;
}


exports.postToPage = async (pageId, message) => {
  // https://graph.facebook.com/v19.0/:page_id/feed?access_token=EACABOlkXZAZCsBOx42zBdoH1F5DbXhkAJ6q753FWA3XxgNgGDaKjGmP5552k7RInFW4OdoKbK1F8OmcwtkFMxIRr4EZB10kd6FyQjin1XFnSdZCHVSkQ4XojxBf4BPm9DZBrMmX13u70tWR960GwndJRVcN9GbwcYGiIdveiUUJ2Sncyzaarvwv5VFZAsGNFKc7ZB5vZBLoZD
  const url = 'https://graph.facebook.com/v19.0/' + pageId + '/feed' + '?access_token=' + process.env.FB_PAGE_TOKEN;
  const headers = {
    'Content-Type': 'application/json'
  };
  return await axiosRequest('post', url, message, headers);
}