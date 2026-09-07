const fs = require('fs');
let code = fs.readFileSync('src/pages/Locations.tsx', 'utf8');

const t1 = ') : (';
const i1 = code.indexOf(t1);
const i2 = code.indexOf('{/* Map Toolbar */}', i1);
if (i2 !== -1) {
  code = code.substring(0, i1 + t1.length) + '\n        <>\n' + code.substring(code.indexOf('{/* Map Toolbar */}', i1));
}

const mapEnd = '</div>\n        )}';
const i3 = code.indexOf('</div>\n          </div>\n        )}');
if (i3 !== -1) {
  code = code.substring(0, i3) + '</div>\n          </div>\n        </>\n        )}' + code.substring(i3 + '</div>\n          </div>\n        )}'.length);
}

fs.writeFileSync('src/pages/Locations.tsx', code);
