# Wilayas and communes data

`wilayas.json` and `communes.json` are copied **unchanged** from
https://github.com/Kenandarabeh/algeria-wilayas-communes-2026
at commit `85a75e4edd1fd466dc5eac44f35014a0725befd6` (2026-09-29), copied 2026-11-17.
Author: Kenanada Abdelouahad Rabah. The repository has no LICENSE file; its README says:
"This dataset is open and free to use for both personal and commercial purposes."

| File | Bytes | SHA-256 |
|------|-------|---------|
| wilayas.json | 8,226 | `23a7cafa5ddb693063bfc328e3e1b9129503b6009a59d2b76f379aaca801f234` |
| communes.json | 393,957 | `a8d0f52eaf1ba41d258f6a75726de036cce128adbdfb7d21add804909ef55b37` |

Do not edit these files: to update, copy the new versions from the repository and
change the commit, sizes and checksums here (and in `test/store-soft-usb.static.test.mjs`).
`.gitattributes` keeps their CRLF line endings and the BOM of communes.json as they are.

## Known problems in this version (handled in `usb/usb.js`, not in the files)

- 69 wilayas (1–58 plus the 11 created in 2025, numbered 59–69) and 1,708 commune rows.
- The communes follow the official numbers (49 Timimoun … 58 El Meniaa), but `wilayas.json`
  has the wrong name for 49, 50, 52, 53, 54, 57 and 58. `usb.js` (`nameFixes`) replaces these
  seven names on the page.
- 99 communes are listed twice in the same wilaya (old and new postal code). The page shows each
  name once.
- Commune "Talmine" (49) has no Arabic name; the page shows the French name.
- `longitude` and `latitude` are swapped in some rows; the page does not use them.
