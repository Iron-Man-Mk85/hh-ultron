import { initGame } from './game';
import { injectStyles, packSettings } from './settings';
import { RemoveADs } from './modules/ads/RemoveADs';
import { HidePopups } from './modules/popups/HidePopups';
import { ClosePopups } from './modules/popups/ClosePopups';
import { AutoConfirm } from './modules/battles/AutoConfirm';
import { SpacebarHelp } from './modules/keyboard/SpacebarHelp';

function runUltron() {
    const { $ } = window;

    if (!$) {
        console.log('WARNING: No jQuery found. Probably an error page. Ending the script here')
        return
    }

    initGame($);
    injectStyles();

    const allModules = [
        new RemoveADs(),
        new HidePopups(),
        new ClosePopups(),
        new AutoConfirm(),
        new SpacebarHelp()
    ]

    setTimeout(() => {
        const runScript = () => {
            const { hhPlusPlusConfig } = window
            if (!hhPlusPlusConfig) return;

            hhPlusPlusConfig.registerGroup({
                key: 'Ultron',
                name: `HH Ultron <small class="ultron-version">v${USERSCRIPT_VERSION_LABEL}</small>`
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

runUltron();
