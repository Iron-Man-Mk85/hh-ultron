// ==UserScript==
// @name           HH Ultron (Testing)
// @version        0.3.8
// @description    3\/11 QoL for KK games
// @author         Iron Man
// @match          https://*.pornstarharem.com/*
// @match          https://*.hentaiheroes.com/*
// @match          https://*.comixharem.com/*
// @match          https://*.mangarpg.com/*
// @match          https://*.amouragent.com/*
// @run-at         document-body
// @namespace      https://github.com/Iron-Man-Mk85/hh-ultron/testing
// @downloadURL    https://raw.githubusercontent.com/Iron-Man-Mk85/hh-ultron/testing/hh-ultron.user.js
// @updateURL      https://raw.githubusercontent.com/Iron-Man-Mk85/hh-ultron/testing/hh-ultron.user.js
// @icon           https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant          none
// ==/UserScript==

/* =================
*  =   Changelog   =
*  =================
*  0.3.8 - Keep wheel scrolling in Ultron's settings pane
*  0.3.7 - Pack settings cards, isolate settings scrolling, and show the script version
*  0.3.6 - Keep HH++ settings cards at their natural height
*  0.3.5 - Fix popup dismissal, spacebar shortcuts, and the homepage ad setting
*  0.3.4 - Fix wrong variable name
*  0.3.3 - Missing parentheses caused bug
*  0.3.2 - Update SpacebarHelp
*  0.3.1 - Update SpacebarHelp
*  0.3.0 - Add SpacebarHelp module
*  0.2.1 - Edit AutoConfirm module for broader usage
*  0.2.0 - Add Daddyrinth relic auto confirmation module
*  0.1.2 - Add league battle AD removal
*  0.1.1 - Add random delay
*  0.1.0 - Add close popups module, tooltips for hide/close popups modules
*  0.0.5 - Add season AD removal
*  0.0.4 - Add harem AD removal
*  0.0.3 - Add love raids AD removal
*  0.0.2 - Merge ADs modules
*  0.0.1 - Initial release
*/

(function() {
    'use strict';

    const { $, location } = window;
    const currentPage = location.pathname;
    const rewardButton = 'button.blue_button_L[confirm_blue_button]';

    if (!$) {
        console.log('WARNING: No jQuery found. Probably an error page. Ending the script here')
        return
    }

    // Define CSS
    const style = document.createElement('style');
    style.className = 'hh-ultron-style';
    style.textContent = `
        .hh-plus-plus-config-panel .group-panel[rel="Ultron"] .panel-contents {
            align-content: start;
            align-items: start;
            overflow-y: auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
        }
        .hh-plus-plus-config-panel:has(> .group-panel[rel="Ultron"].shown) {
            overflow: clip;
        }
        .hh-plus-plus-config-panel .group-panel[rel="Ultron"] .config-setting.has-subsettings {
            grid-row-end: auto;
        }
        .hh-plus-plus-config-panel .group-panel[rel="Ultron"] .ultron-packed-settings {
            grid-auto-flow: row dense;
            grid-auto-rows: 1px;
            row-gap: 0;
        }
        .hh-plus-plus-config-panel .group-panel[rel="Ultron"] .ultron-packed-settings .config-setting {
            grid-row-end: span var(--ultron-setting-rows, 1);
        }
        .hh-plus-plus-config-panel .ultron-version {
            font-size: .66em;
            font-weight: normal;
            opacity: .8;
        }
    `;
    document.head.appendChild(style);

    function packSettings() {
        if (currentPage !== '/home.html') return;

        const selector = '.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .panel-contents';
        window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
            const panel = document.querySelector(selector);
            panel.classList.remove('hh-scroll');
            window.addEventListener('wheel', event => {
                if (event.ctrlKey || !panel.contains(event.target)) return;

                event.preventDefault();
                event.stopImmediatePropagation();
                const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
                const scale = panel.getBoundingClientRect().height / panel.offsetHeight || 1;
                panel.scrollTop += event.deltaY * unit / scale;
            }, { capture: true, passive: false });

            const cards = panel.querySelectorAll('.config-setting');
            const pack = () => {
                if (!panel.offsetWidth) return;

                for (const card of cards) {
                    card.style.setProperty('--ultron-setting-rows', card.offsetHeight + 10);
                }
                panel.classList.add('ultron-packed-settings');
            };
            const groupObserver = new MutationObserver(pack);
            groupObserver.observe(panel.parentElement, { attributeFilter: ['class'] });
            if (typeof ResizeObserver !== 'undefined') {
                const sizeObserver = new ResizeObserver(pack);
                cards.forEach(card => sizeObserver.observe(card));
            }
            pack();
        });
    }

    function observeUntil(selector, callback, { once = true, timeout = 5000 } = {}) {
        let timer = null;

        let elements = document.querySelectorAll(selector);
        if (elements.length) {
            callback(elements);
            if (once) return;
        }

        const observer = new MutationObserver(() => {
            elements = document.querySelectorAll(selector);
            if (elements.length) {
                if (once) {
                    observer.disconnect();
                    if (timer) clearTimeout(timer);
                }
                callback(elements);
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Pass `timeout: null` (or any non-finite value) to disable the timeout
        if (Number.isFinite(timeout) && timeout > 0) {
            timer = setTimeout(() => {
                observer.disconnect();
            }, timeout);
        }
    }

    function removeWhenSelectorAvailable(selector, { once = true, timeout = 5000 } = {}) {
        observeUntil(selector, (elements) => {
            elements.forEach(el => el.remove());
        }, { timeout, once });
    }

    function hideWhenSelectorAvailable(selector, { once = true, timeout = 5000 } = {}) {
        observeUntil(selector, (elements) => {
            elements.forEach(el => {
                el.style.display = 'none';
        });
        }, { timeout, once });
    }

    function isVisible(el) {
        return !!(el?.isConnected && el.getClientRects().length &&
            !el.closest('[hidden], [inert], [aria-hidden="true"]') && getComputedStyle(el).visibility === 'visible');
    }

    function isClickable(el) {
        return isVisible(el) && !el.matches(':disabled, .disabled, [aria-disabled="true"]');
    }

    function getClickDelay(delay) {
        return Array.isArray(delay)
            ? Math.floor(Math.random() * (delay[1] - delay[0] + 1)) + delay[0]
            : delay;
    }

    function closeTargetWhenTriggerAvailableInsideContainer(containerSelector, { triggerSelector, targetSelector = '.closable', once = true, timeout = 5000, delay = 0 } = {}) {
        let container = null;
        let activePopup = null;
        let clicked = false;
        let pending = null;
        let expiry = null;

        const getActivePopup = () => {
            const popup = document.querySelector(containerSelector);
            if (!isVisible(popup)) return null;
            if (triggerSelector && !Array.from(popup.querySelectorAll(triggerSelector)).some(isVisible)) return null;
            return popup;
        };

        const getTarget = (popup) => {
            const targets = Array.from(popup.querySelectorAll(targetSelector)).filter(isClickable);
            return targets.length === 1 ? targets[0] : null;
        };

        const check = () => {
            container = document.querySelector(containerSelector);
            const popup = getActivePopup();
            if (popup !== activePopup) {
                clearTimeout(pending);
                pending = null;
                clicked = false;
                activePopup = popup;
            }
            if (!popup || clicked || pending !== null || !getTarget(popup)) return;

            const click = () => {
                pending = null;
                if (getActivePopup() !== popup) return;
                const target = getTarget(popup);
                if (!target) return;

                clicked = true;
                if (once) {
                    observer.disconnect();
                    clearTimeout(expiry);
                }
                target.click();
            };

            const computedDelay = getClickDelay(delay);
            if (computedDelay > 0) pending = setTimeout(click, computedDelay);
            else click();
        };

        const observer = new MutationObserver((mutations) => {
            const current = document.querySelector(containerSelector);
            if (current !== container || (current && mutations.some(({ target }) => current.contains(target) || target.contains(current)))) check();
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'hidden', 'inert', 'aria-hidden', 'disabled', 'aria-disabled']
        });
        if (Number.isFinite(timeout) && timeout > 0) expiry = setTimeout(() => observer.disconnect(), timeout);
        check();
    }

    function removeClassWhenSelectorAvailable(selector, classToRemove, { once = true, timeout = 5000 } = {}) {
        observeUntil(selector, (elements) => {
            elements.forEach(el => el.classList.remove(classToRemove));
        }, { timeout, once });
    }

    function clickWhenSelectorAvailable(selector, elementToClick, { delay = 2000, once = true, timeout = 5000 } = {}) {
        let pending = false;
        let hasClicked = false;

        observeUntil(selector, () => {
            if (hasClicked || pending) return;

            const closeElement = document.querySelector(elementToClick);
            if (isClickable(closeElement)) {
                pending = true;
                setTimeout(() => {
                    pending = false;
                    if (isClickable(closeElement) && Array.from(document.querySelectorAll(selector)).some(isVisible)) {
                        hasClicked = true;
                        closeElement.click();
                    }
                }, getClickDelay(delay));
            }
        }, { timeout, once });
    }

    function spacebarToClick(selectors) {
        document.addEventListener('keydown', (e) => {
            if (e.key !== ' ' && e.code !== 'Space') return;
            if (e.defaultPrevented || e.repeat || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            if (e.target?.closest?.('input, textarea, select, button, a[href], [role="button"], [contenteditable]:not([contenteditable="false"])')) return;

            for (const { selector, triggerSelector } of selectors) {
                if (triggerSelector && !Array.from(document.querySelectorAll(triggerSelector)).some(isVisible)) continue;
                const targets = Array.from(document.querySelectorAll(selector)).filter(isClickable);
                if (targets.length !== 1) continue;

                const [el] = targets;
                const rect = el.getBoundingClientRect();
                const posX = rect.left + rect.width / 2;
                const posY = rect.top + rect.height / 2;
                if (!el.contains(document.elementFromPoint(posX, posY))) continue;

                e.preventDefault();
                el.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    clientX: posX, clientY: posY,
                    screenX: posX, screenY: posY}));
                return;
            }
        });
    }

    class HHModule {
        constructor({ group, configSchema }) {
            this.group = 'Ultron'
            this.configSchema = configSchema
            this.hasRun = false
        }
    }

    class RemoveADs extends HHModule {
        constructor() {
            const baseKey = 'removeADs'
            const configSchema = {
                baseKey,
                default: false,
                label: `Remove ADs from the game`,
                subSettings: [{
                    key: 'close_home',
                    label: `Close ADs in homepage. Keep kobans collecting`,
                    default: false
                }]
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/activities.html') || 
            (/\/quest\/\d+$/.test(currentPage)) || 
            currentPage.includes('/boss-bang-battle.html') || 
            currentPage.includes('/champions-map.html') || 
            currentPage.includes('/god-path.html') || 
            (/\/characters\/\d+$/.test(currentPage)) || 
            currentPage.includes('/home.html') || 
            currentPage.includes('/labyrinth.html') || 
            currentPage.includes('/labyrinth-battle.html') || 
            currentPage.includes('/labyrinth-pre-battle.html') || 
            currentPage.includes('/league-battle.html') || 
            currentPage.includes('/love-raids.html') || 
            currentPage.includes('/pantheon-battle.html') || 
            currentPage.includes('/season.html') || 
            currentPage.includes('/season-battle.html') || 
            currentPage.includes('/shop.html') || 
            currentPage.includes('/troll-battle.html') || 
            currentPage.includes('/world-boss-battle.html')
        }

        run({ close_home }) {
            if (this.hasRun || !this.shouldRun()) {return}

            if (currentPage.includes('/activities.html')) {
                hideWhenSelectorAvailable('.ad-revive-container', { once: false });
                removeClassWhenSelectorAvailable('.height-for-ad', 'height-for-ad', { once: false });
            } else if (/\/quest\/\d+$/.test(currentPage)) {
                hideWhenSelectorAvailable('#ad_quest');
            } else if (currentPage.includes('/boss-bang-battle.html')) {
                hideWhenSelectorAvailable('#ad_battle');
            } else if (currentPage.includes('/champions-map.html')) {
                hideWhenSelectorAvailable('#ad_champions_map');
            } else if (currentPage.includes('/god-path.html')) {
                hideWhenSelectorAvailable('#ad_god-path');
            } else if (/\/characters\/\d+$/.test(currentPage)) {
                hideWhenSelectorAvailable('#ad_harem');
            } else if (currentPage.includes('/home.html')) {
                if (close_home) clickWhenSelectorAvailable('.become-member-text', 'close', { delay: [500, 1500], once: false });
            } else if (currentPage.includes('/labyrinth.html')) {
                hideWhenSelectorAvailable('#ad_labyrinth', { once: false, timeout: null });
            } else if (currentPage.includes('/labyrinth-battle.html')) {
                hideWhenSelectorAvailable('#ad_battle');
            } else if (currentPage.includes('/labyrinth-pre-battle.html')) {
                hideWhenSelectorAvailable('#ad_labyrinth-pre-battle', { once: false });
            } else if (currentPage.includes('/league-battle.html')) {
                hideWhenSelectorAvailable('#ad_battle');
            } else if (currentPage.includes('/love-raids.html')) {
                hideWhenSelectorAvailable('#ad_love_raids');
                removeClassWhenSelectorAvailable('.height-for-ad', 'height-for-ad', { once: false });
            } else if (currentPage.includes('/pantheon-battle.html')) {
                hideWhenSelectorAvailable('#ad_battle');
            } else if (currentPage.includes('/season.html')) {
                hideWhenSelectorAvailable('#ad_season');
            } else if (currentPage.includes('/season-battle.html')) {
                hideWhenSelectorAvailable('#ad_battle');
            } else if (currentPage.includes('/shop.html')) {
                hideWhenSelectorAvailable('#ad_shop');
            } else if (currentPage.includes('/troll-battle.html')) {
                hideWhenSelectorAvailable('#ad_battle');
            } else if (currentPage.includes('/world-boss-battle.html')) {
                hideWhenSelectorAvailable('#ad_battle');
            }

            this.hasRun = true
        }
    }

    class HidePopups extends HHModule {
        constructor() {
            const baseKey = 'hidePopups'
            const configSchema = {
                baseKey,
                default: false,
                label: `<span tooltip="Dismisses these popups if they open during the first 2 seconds. Use either this or 'Close popups from'.">Hide shop and news popups from the homepage</span>`,
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/home.html')
        }

        run() {
            if (this.hasRun || !this.shouldRun()) {return}

            closeTargetWhenTriggerAvailableInsideContainer('#no_HC', { timeout: 2000 });
            closeTargetWhenTriggerAvailableInsideContainer('#news_details_popup', { targetSelector: '.back_button', timeout: 2000 });
            closeTargetWhenTriggerAvailableInsideContainer('#popup_news', { timeout: 2000 });

            this.hasRun = true
        }
    }

    class ClosePopups extends HHModule {
        constructor() {
            const baseKey = 'closePopups'
            const configSchema = {
                baseKey,
                default: false,
                label: `<span tooltip="more precise and you can select all the options you want. looks for 2 seconds and makes a click on the X to close after a random 250-300 ms. use either this OR the 'Hide' one">Close popups from:</span>`,
                subSettings: [{
                    key: 'homepage',
                    label: `Homepage`,
                    default: true
                }, {
                    key: 'season',
                    label: `Season`,
                    default: true,
                }]
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/home.html') ||
            currentPage.includes('/season.html')
        }

        run({ homepage, season }) {
            if (this.hasRun || !this.shouldRun()) {return}

            if (currentPage.includes('/home.html') && homepage) {
                closeTargetWhenTriggerAvailableInsideContainer('#no_HC', { timeout: 2000, delay: [250,300] });
                closeTargetWhenTriggerAvailableInsideContainer('#news_details_popup', { targetSelector: '.back_button', timeout: 2000, delay: [250,300] });
                closeTargetWhenTriggerAvailableInsideContainer('#popup_news', { timeout: 2000, delay: [250,300] });
                closeTargetWhenTriggerAvailableInsideContainer('#trial_monthly_card_popup', { timeout: 2000, delay: [250,300] });
                closeTargetWhenTriggerAvailableInsideContainer('#unique_deal_popup', { timeout: 2000, delay: [250,300] });
            } else if (currentPage.includes('/season.html') && season) {
                closeTargetWhenTriggerAvailableInsideContainer('#pass_reminder_popup', { timeout: 2000, delay: [250,300] });
            }

            this.hasRun = true
        }
    }

    class AutoConfirm extends HHModule {
        constructor() {
            const baseKey = 'autoConfirm'
            const configSchema = {
                baseKey,
                default: false,
                label: `Close specific on screen windows:`,
                subSettings: [{
                    key: 'daddyrinthRelic',
                    label: `Daddyrinth relic confirmation`,
                    default: false
                }, {
                    key: 'leagueWin',
                    label: `League win confirmation`,
                    default: false
                // }, {
                //     key: 'leagueLoss',
                //     label: `League loss confirmation`,
                //     default: false
                }, {
                    key: 'pantheonLoss',
                    label: `Pantheon loss confirmation`,
                    default: false
                }]
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/labyrinth.html') ||
            currentPage.includes('/leagues.html') ||
            currentPage.includes('/league-battle.html') ||
            currentPage.includes('/pantheon-battle.html')
        }

        run({ daddyrinthRelic, leagueWin, pantheonLoss }) {
            if (this.hasRun || !this.shouldRun()) {return}

            if (currentPage.includes('/labyrinth.html') && daddyrinthRelic) {
                closeTargetWhenTriggerAvailableInsideContainer('#labyrinth_reward_popup', { targetSelector: '#close-relic-popup', timeout: null, delay: [50,150] });
            } else if ((currentPage.includes('/leagues.html') || currentPage.includes('/league-battle.html')) && leagueWin) {
                closeTargetWhenTriggerAvailableInsideContainer('#rewards_popup', { triggerSelector: '#reward_holder', targetSelector: rewardButton, once: false, timeout: null, delay: [50,150] });
            // } else if (currentPage.includes('/leagues.html') || currentPage.includes('/league-battle.html') && leagueLoss) {
            //     closeTargetWhenTriggerAvailableInsideContainer('#rewards_popup', { triggerSelector: '#upgrade_characters', targetSelector: rewardButton, once: false, timeout: null, delay: [50,150] });
            } else if (currentPage.includes('/pantheon-battle.html') && pantheonLoss) {
                closeTargetWhenTriggerAvailableInsideContainer('#rewards_popup', { triggerSelector: '.lost-first-row', targetSelector: rewardButton, timeout: null, delay: [50,150] });
            }

            this.hasRun = true
        }
    }

    class SpacebarHelp extends HHModule {
        constructor() {
            const baseKey = 'spacebarHelp'
            const configSchema = {
                baseKey,
                default: false,
                label: `Use spacebar to close:`,
                subSettings: [{
                    key: 'daddyrinthRelic',
                    label: `Daddyrinth flow confirmations`,
                    default: false
                }, {
                    key: 'daddyrinthBattle',
                    label: `Daddyrinth MM-perform_and_skip, rewards (only if won)`,
                    default: false
                }, {
                    key: 'leagueBattle',
                    label: `League battle confirmation`,
                    default: false
                }, {
                    key: 'activitiesReward',
                    label: `Rewards in Activities page`,
                    default: false
                }]
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/labyrinth.html') ||
            currentPage.includes('/labyrinth-pre-battle.html') ||
            currentPage.includes('/labyrinth-battle.html') ||
            currentPage.includes('/leagues.html') ||
            currentPage.includes('/league-battle.html') ||
            currentPage.includes('/activities.html')
        }

        run({ daddyrinthRelic, daddyrinthBattle, leagueBattle, activitiesReward }) {
            if (this.hasRun || !this.shouldRun()) {return}

            if (currentPage.includes('/labyrinth.html') && daddyrinthRelic) {
                spacebarToClick([
                    { selector: '#labyrinth_reward_popup #close-relic-popup' },
                    { selector: `#rewards_popup ${rewardButton}` },
                    { selector: '#heal_girl_labyrinth_popup button.blue_button_L' }
                ]);
            } else if ((currentPage.includes('/labyrinth-pre-battle.html') || currentPage.includes('/labyrinth-battle.html')) && daddyrinthBattle) {
                spacebarToClick([
                    { selector: `#rewards_popup ${rewardButton}`, triggerSelector: '#rewards_popup #reward_holder' },
                    { selector: '#pre-battle .blue_button_L:nth-of-type(2)' }
                ]);
            } else if ((currentPage.includes('/leagues.html') || currentPage.includes('/league-battle.html')) && leagueBattle) {
                spacebarToClick([{ selector: `#rewards_popup ${rewardButton}` }]);
            } else if (currentPage.includes('/activities.html') && activitiesReward) {
                spacebarToClick([{ selector: `#rewards_popup ${rewardButton}` }]);
            }

            this.hasRun = true
        }
    }

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

            hhPlusPlusConfig.registerGroup({
                key: 'Ultron',
                name: 'HH Ultron <small class="ultron-version">v0.3.8 testing</small>'
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
})();
