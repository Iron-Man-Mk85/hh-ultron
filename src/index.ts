import { initGame } from './game';
import { injectStyles, packSettings } from './settings';
import { RemoveADs } from './modules/ads/RemoveADs';
import { HidePopups } from './modules/popups/HidePopups';
import { ClosePopups } from './modules/popups/ClosePopups';
import { AutoConfirm } from './modules/battles/AutoConfirm';
import { SpacebarHelp } from './modules/keyboard/SpacebarHelp';
import { UpdateNotice } from './modules/updates/UpdateNotice';

const removeAds = new RemoveADs();
removeAds.runFromSavedSettings();

function runUltron() {
    const { $ } = window;

    if (!$) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runUltron, { once: true });
            return;
        } else if (document.readyState !== 'complete') {
            window.addEventListener('load', runUltron, { once: true });
            return;
        }
        console.log('WARNING: No jQuery found. Probably an error page. Ending the script here')
        return
    }

    initGame($);
    injectStyles();

    const allModules = [
        removeAds,
        new HidePopups(),
        new ClosePopups(),
        new AutoConfirm(),
        new SpacebarHelp(),
        new UpdateNotice()
    ]

    setTimeout(() => {
        const runScript = () => {
            const { hhPlusPlusConfig } = window
            if (!hhPlusPlusConfig) return;

            hhPlusPlusConfig.registerGroup({
                key: 'Ultron',
                name: 'HH Ultron'
            })
            allModules.forEach(module => {
                hhPlusPlusConfig.registerModule(module)
            })
            hhPlusPlusConfig.loadConfig()
            hhPlusPlusConfig.runModules()
            packSettings();
        }

        if (window.hhPlusPlusConfig) {
            runScript()
        } else {
            $(document).one('hh++-bdsm:loaded', runScript)
        }
    }, 1)
}

if (document.body) runUltron();
else {
    // Only the ad guard needs to run before the body exists.
    const waitForBody = new MutationObserver(() => {
        if (!document.body) return;
        waitForBody.disconnect();
        runUltron();
    });
    waitForBody.observe(document, { childList: true, subtree: true });
}
