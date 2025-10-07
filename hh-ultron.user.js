// ==UserScript==
// @name           HH Ultron
// @version        0.1.2
// @description    3\/11 QoL for KK games
// @author         Iron Man
// @match          https://*.pornstarharem.com/*
// @match          https://*.hentaiheroes.com/*
// @match          https://*.comixharem.com/*
// @match          https://*.mangarpg.com/*
// @match          https://*.amouragent.com/*
// @run-at         document-body
// @namespace      https://github.com/Iron-Man-Mk85/hh-ultron
// @downloadURL    https://raw.githubusercontent.com/Iron-Man-Mk85/hh-ultron/main/hh-ultron.user.js
// @updateURL      https://raw.githubusercontent.com/Iron-Man-Mk85/hh-ultron/main/hh-ultron.user.js
// @icon           https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant          none
// ==/UserScript==

/* =================
*  =   Changelog   =
*  =================
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
    const tab = location.search;

    if (!$) {
        console.log('WARNING: No jQuery found. Probably an error page. Ending the script here')
        return
    }

    // Define CSS
    const sheet = (() => {
        const style = document.createElement('style')
        style.setAttribute('class', 'hh-jarvis-style')
        document.head.appendChild(style)
        style.sheet.insertRules = (rules) => {
            rules.replace(/ {4}/g, '').split(/(?<=})\n/g).map(rule => rule.replace(/\n/g, '')).forEach(rule => {
                try {
                    style.sheet.insertRule(rule)
                } catch {
                    console.log(`Error adding style rules:\n${rule}`)
                }
            })
        }
        return style.sheet
    })();

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

    function hideTargetWhenTriggerAvailable(triggerSelector, targetSelector, { once = true, timeout = 5000, delay = 0 } = {}) {
        observeUntil(triggerSelector, () => {
            const hide = () => {
                document.querySelectorAll(targetSelector).forEach(el => {
                    if (el && el.isConnected) el.style.display = 'none';
                });
            };
            if (Number.isFinite(delay) && delay > 0) setTimeout(hide, delay);
            else hide();
        }, { once, timeout });
    }

    function closeTargetWhenTriggerAvailableInsideContainer(triggerSelector, { containerSelector = triggerSelector, targetSelector = '.closable', once = true, timeout = 5000, delay = 0 } = {}) {
        observeUntil(triggerSelector, () => {
            const clickFn = () => {
                document.querySelectorAll(`${containerSelector} ${targetSelector}`).forEach(el => {
                    if (el && el.isConnected) el.click();
                });
            };
            if (Number.isFinite(delay) && delay > 0) setTimeout(clickFn, delay);
            else clickFn();
        }, { once, timeout });
    }

    function removeClassWhenSelectorAvailable(selector, classToRemove, { once = true, timeout = 5000 } = {}) {
        observeUntil(selector, (elements) => {
            elements.forEach(el => el.classList.remove(classToRemove));
        }, { timeout, once });
    }

    function clickWhenSelectorAvailable(selector, elementToClick, { delay = 2000, once = true, timeout = 5000 } = {}) {
        let hasClicked = false;

        observeUntil(selector, () => {
            if (hasClicked) return;

            const closeElement = document.querySelector(elementToClick);
            if (closeElement) {
                // allow `delay` to be a number or an array [min, max]
                const computedDelay = (Array.isArray(delay) && delay.length >= 2)
                    ? Math.floor(Math.random() * (delay[1] - delay[0] + 1)) + delay[0]
                    : Number(delay) || 0;

                setTimeout(() => {
                    if (!hasClicked && closeElement.isConnected) {
                        closeElement.click();
                        hasClicked = true;
                    }
                }, computedDelay);

                if (once) hasClicked = true; // prevent retriggers
            }
        }, { timeout, once });
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

        run(close_home) {
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
                label: `<span tooltip="safe for game, but can hide something more. looks for 2 seconds and hides the whole popup container. use either this OR 'Close popups from'">Hide shop and news popups from the homepage</span>`,
            }
            super({name: baseKey, configSchema});
        }

        shouldRun() {
            return currentPage.includes('/home.html')
        }

        run() {
            if (this.hasRun || !this.shouldRun()) {return}

            hideTargetWhenTriggerAvailable('#no_HC', '#common-popups', { timeout: 2000 });
            hideTargetWhenTriggerAvailable('#news_details_popup', '#common-popups', { timeout: 2000 });
            hideTargetWhenTriggerAvailable('#popup_news', '#common-popups', { timeout: 2000 });

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
            return currentPage.includes('/home.html') || currentPage.includes('/season.html')
        }

        run({ homepage, season }) {
            if (this.hasRun || !this.shouldRun()) {return}

            if (currentPage.includes('/home.html') && homepage) {
                closeTargetWhenTriggerAvailableInsideContainer('#no_HC', { timeout: 2000, delay: [250,300] });
                closeTargetWhenTriggerAvailableInsideContainer('#news_details_popup', { targetSelector: '.back_button', timeout: 2000, delay: [250,300] });
                closeTargetWhenTriggerAvailableInsideContainer('#popup_news', { timeout: 2000, delay: [250,300] });
                closeTargetWhenTriggerAvailableInsideContainer('#trial_monthly_card_popup', { timeout: 2000, delay: [250,300] });
            } else if (currentPage.includes('/season.html') && season) {
                closeTargetWhenTriggerAvailableInsideContainer('#pass_reminder_popup', { timeout: 2000, delay: [250,300] });
            }

            this.hasRun = true
        }
    }

    const allModules = [
        new RemoveADs(),
        new HidePopups(),
        new ClosePopups()
    ]

    setTimeout(() => {
        if (window.HHPlusPlus) {
            const runScript = () => {
                const { hhPlusPlusConfig } = window

                hhPlusPlusConfig.registerGroup({
                    key: 'Ultron',
                    name: 'HH Ultron'
                })
                allModules.forEach(module => {
                    hhPlusPlusConfig.registerModule(module)
                })
                hhPlusPlusConfig.loadConfig()
                hhPlusPlusConfig.runModules()
            }

            if (window.hhPlusPlusConfig) {
                runScript()
            } else {
                $(document).on('hh++-bdsm:loaded', runScript)
            }
        } else if (!(['/integrations/', '/index.php'].some(path => path === location.pathname) && location.hostname.includes('nutaku'))) {
            console.log('WARNING: HH++ BDSM not found. Ending the script here')
        }
    }, 1)
})();
