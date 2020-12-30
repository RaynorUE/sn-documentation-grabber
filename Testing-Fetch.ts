import * as fetch from 'node-fetch';

fetch("https://developer.servicenow.com/devportal.do?sysparm_data=%7B%22action%22:%22api.navlist%22,%22data%22:%7B%22navbar%22:%22server%22,%22release%22:%22paris%22%7D%7D", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-usertoken": "b767220fdb55e0d03761d9d9689619ae452b73d7d5fce977f573203037adf226e4062ee5",
    "cookie": "JSESSIONID=73737A92D3289BC0427DF3B33A24F434; glide_user_route=glide.1ef368f4f0eac166600f16d134687dfe; BIGipServerpool_devportalprod=2843826698.35390.0000; AMCVS_2A2A138653C66CB60A490D45%40AdobeOrg=1; AMCV_2A2A138653C66CB60A490D45%40AdobeOrg=-408604571%7CMCIDTS%7C18627%7CMCMID%7C85653798948572947971950703705158001165%7CMCOPTOUT-1609302832s%7CNONE%7CvVersion%7C4.6.0"
  },
  "referrer": "https://developer.servicenow.com/dev.do",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors"
});