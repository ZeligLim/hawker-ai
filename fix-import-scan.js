const fs = require('fs');
let code = fs.readFileSync('src/app/(customer)/scan/page.tsx', 'utf8');

code = code.replace("import { Suspense, useEffect, useState } from 'react';", "import { Suspense, useEffect, useState, useCallback } from 'react';");

fs.writeFileSync('src/app/(customer)/scan/page.tsx', code);
