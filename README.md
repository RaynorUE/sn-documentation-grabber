sn-documentation-grabber

# Setup Steps
1. After copying repo run `npm install` to install all the dependencies..

# Run Me Steps

## Get Raw JSON Data from developers.service-now.com
1. Run `npm run build` in your console to generate the JS Files from TS
2. Open your browser, navigate to https://developer.servicenow.com
3. Open your browser console
4. Open the axios.min.js file, and copy/paste all content into your conosle and hit enter (This loads axios into the browser);
5. After running step #1, you should have a "Dist" folder created, and inside will be `Server-ScopedAPI.js`
  1. Open this file, find/replace axios_1 with "axios";
  2. Copy from line 10 `(async function () {` to the bottom
  3. Paste into your browser console
  4. Hit enter, and wait... You can open your network tab if you want to see fun progress bars.
6. This will eventually output a log statement with the reformatted JSON..
7. At bottom of the log statement will be a "Show more" and a "Copy" link... click on copy to easily copy all the log text to your clipboard
8. Open the paris_server.json (or create a new one if you want) and paste the content in there..

## Convert Raw Developer JSON to "typescript definition file
1. After completing above, and getting your `paris_server.json` file store..
2. Execute `npm run tsdef`