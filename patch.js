const fs = require('fs');
const file = 'app/(customer)/orders/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = "          </section>\n        </div>\n      </div>\n\n      {customizingItem ? (";

const replace = `          </section>

          {placedReceipt && (
            <div className="mt-6 mb-8 w-full max-w-lg mx-auto">
              <CustomerReceipt initialData={placedReceipt} onClearActive={() => { clearActiveOrder(); setPlacedReceipt(null); setCheckoutState('idle'); }} />
            </div>
          )}
        </div>
      </div>

      {customizingItem ? (`

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
  console.log("Patched successfully");
} else {
  console.log("Could not find search string");
}
