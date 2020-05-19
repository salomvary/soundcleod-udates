const http = require("http");
const assert = require("assert").strict;

const baseUrl = "http://localhost:5000";

const v130 = {
  url:
    "https://github.com/salomvary/soundcleod/releases/download/v1.3.0/soundcleod-1.3.0-mac.zip",
  name: "1.3.0",
  notes:
    "- Add MacBook Touch Bar support\r\n- Support Windows back/forward/home keys (experimental)\r\n\n- Fix full screen closing/quitting on macOS #139\r\n- Add like/unlike to the main and dock menus #135 \r\n- Show album art on desktop notification\n- Fix black screen when closing fullscreen app\r\n\n- Fix accidental back navigation when scrolling\n\n- Add experimental swipe back/forward navigation\n- Fix media key flakyness under some circumstances\n- Fix crash on startup #130\n\n- Release SoundCleod for Windows\n- Yet another fix for Facebook login\n\n- Allow hiding main window with Cmd+1 \n- Prevent quitting with Cmd+W #128\n\n- Fix broken play/pause/prev/next menu items\n- Prevent exception on right clicking certain elements #122\n- Download updates from https://updates.soundcleod.com\n\n- Fix Google login (again)\n- Improve how window position is saved\n\n- Log detailed errors for easier debugging\n\n- Improve when the error screen is shown\n- Show error code on the error screen\n- Open share windows within SoundCleod (again)\n- Fix Facebook login (again)\n\nFixed a couple of bugs and added a few missing features:\n- Fix Facebook login\n- Open external links in system browser\n- Add standard actions to the context menu\n- Remember window position and dimensions\n- Tweak miniumm and default window dimensions\n- Add Dock menu\n- Add context menu back/forward navigation\n- Add basic loading/error indicators\n- Fix login/share windows width/height\n\n",
  pub_date: "2017-04-20T18:35:41.000Z",
};

async function tests() {
  // 1.3.0 pivot version
  assert.deepEqual(await get(`${baseUrl}/update/darwin/1.0.0`), v130, 'Old version to 1.3.0');
  assert.deepEqual(await get(`${baseUrl}/update/darwin_x64/1.2.0`), v130, 'Old version with arch to 1.3.0');
  assert.deepEqual(await get(`${baseUrl}/update/osx/1.2.0`), v130), 'Old version with platform alias to 1.3.0';
  assert.notDeepEqual(await get(`${baseUrl}/update/mac/1.3.0`), v130, '1.3.0 to latest');
  assert.notDeepEqual(await get(`${baseUrl}/update/win/1.0.0`), v130, 'Old version on Windows to latest');
  assert.notDeepEqual(await get(`${baseUrl}/update/win/1.3.0`), v130, '1.3.0 on Windows to latest');

  // Non-pivot version
  assert.notDeepEqual(await get(`${baseUrl}/update/mac/1.3.4`), v130, '1.3.4 to latest');
  assert.ok((await get(`${baseUrl}/update/mac/1.3.4`)).name, 'Non-pivot version looks like an update response');
}

tests()
  .then(() => console.log("All tests passed ✅"))
  .catch(console.error);

function get(url) {
  return new Promise((resolve, reject) =>
    http
      .get(url, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", (err) => {
        reject(err);
      })
  );
}
