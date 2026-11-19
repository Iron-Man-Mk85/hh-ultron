// ==UserScript==
// @name           HH Ultron (Testing)
// @version        0.3.9
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

"use strict";
"use strict";
(() => {
  // src/game.ts
  var $;
  var currentPage;
  var rewardButton = "button.blue_button_L[confirm_blue_button]";
  function initGame(jQuery) {
    $ = jQuery;
    currentPage = window.location.pathname;
  }

  // src/settings.css
  var settings_default = '.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .panel-contents {\n    align-content: start;\n    align-items: start;\n    overflow-y: auto;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n}\n.hh-plus-plus-config-panel:has(> .group-panel[rel="Ultron"].shown) {\n    overflow: clip;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .config-setting.has-subsettings {\n    grid-row-end: auto;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .ultron-packed-settings {\n    grid-auto-flow: row dense;\n    grid-auto-rows: 1px;\n    row-gap: 0;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .ultron-packed-settings .config-setting {\n    grid-row-end: span var(--ultron-setting-rows, 1);\n}\n.hh-plus-plus-config-panel .ultron-version {\n    font-size: .66em;\n    font-weight: normal;\n    opacity: .8;\n}\n';

  // src/settings.ts
  function injectStyles() {
    const style = document.createElement("style");
    style.className = "hh-ultron-style";
    style.textContent = settings_default;
    document.head.appendChild(style);
  }
  function packSettings() {
    if (currentPage !== "/home.html") return;
    const selector = '.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .panel-contents';
    window.HHPlusPlus.Helpers.doWhenSelectorAvailable(selector, () => {
      const panel = document.querySelector(selector);
      if (!panel) return;
      panel.classList.remove("hh-scroll");
      window.addEventListener("wheel", (event) => {
        if (event.ctrlKey || !(event.target instanceof Node) || !panel.contains(event.target)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
        const scale = panel.getBoundingClientRect().height / panel.offsetHeight || 1;
        panel.scrollTop += event.deltaY * unit / scale;
      }, { capture: true, passive: false });
      const cards = panel.querySelectorAll(".config-setting");
      const pack = () => {
        if (!panel.offsetWidth) return;
        for (const card of cards) {
          card.style.setProperty("--ultron-setting-rows", String(card.offsetHeight + 10));
        }
        panel.classList.add("ultron-packed-settings");
      };
      const groupObserver = new MutationObserver(pack);
      if (panel.parentElement) groupObserver.observe(panel.parentElement, { attributeFilter: ["class"] });
      if (typeof ResizeObserver !== "undefined") {
        const sizeObserver = new ResizeObserver(pack);
        cards.forEach((card) => sizeObserver.observe(card));
      }
      pack();
    });
  }

  // src/HHModule.ts
  var HHModule = class {
    group = "Ultron";
    configSchema;
    hasRun = false;
    constructor({ configSchema }) {
      this.configSchema = configSchema;
    }
  };

  // src/dom.ts
  function observeUntil(selector, callback, { once = true, timeout = 5e3 } = {}) {
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
    if (timeout !== null && Number.isFinite(timeout) && timeout > 0) {
      timer = setTimeout(() => {
        observer.disconnect();
      }, timeout);
    }
  }
  function hideWhenSelectorAvailable(selector, { once = true, timeout = 5e3 } = {}) {
    observeUntil(selector, (elements) => {
      elements.forEach((el) => {
        el.style.display = "none";
      });
    }, { timeout, once });
  }
  function isVisible(el) {
    return !!(el?.isConnected && el.getClientRects().length && !el.closest('[hidden], [inert], [aria-hidden="true"]') && getComputedStyle(el).visibility === "visible");
  }
  function isClickable(el) {
    return isVisible(el) && !el.matches(':disabled, .disabled, [aria-disabled="true"]');
  }
  function getClickDelay(delay) {
    return Array.isArray(delay) ? Math.floor(Math.random() * (delay[1] - delay[0] + 1)) + delay[0] : delay;
  }
  function closeTargetWhenTriggerAvailableInsideContainer(containerSelector, { triggerSelector, targetSelector = ".closable", once = true, timeout = 5e3, delay = 0 } = {}) {
    let container = null;
    let activePopup = null;
    let clicked = false;
    let pending = null;
    let expiry;
    const getActivePopup = () => {
      const popup = document.querySelector(containerSelector);
      if (!isVisible(popup)) return null;
      if (triggerSelector && !Array.from(popup.querySelectorAll(triggerSelector)).some((element) => isVisible(element))) return null;
      return popup;
    };
    const getTarget = (popup) => {
      const targets = Array.from(popup.querySelectorAll(targetSelector)).filter((element) => isClickable(element));
      return targets.length === 1 ? targets[0] : null;
    };
    const check = () => {
      container = document.querySelector(containerSelector);
      const popup = getActivePopup();
      if (popup !== activePopup) {
        if (pending !== null) clearTimeout(pending);
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
      if (current !== container || current && mutations.some(({ target }) => current.contains(target) || target.contains(current))) check();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "inert", "aria-hidden", "disabled", "aria-disabled"]
    });
    if (timeout !== null && Number.isFinite(timeout) && timeout > 0) expiry = setTimeout(() => observer.disconnect(), timeout);
    check();
  }
  function removeClassWhenSelectorAvailable(selector, classToRemove, { once = true, timeout = 5e3 } = {}) {
    observeUntil(selector, (elements) => {
      elements.forEach((el) => el.classList.remove(classToRemove));
    }, { timeout, once });
  }
  function clickWhenSelectorAvailable(selector, elementToClick, { delay = 2e3, once = true, timeout = 5e3 } = {}) {
    let pending = false;
    let hasClicked = false;
    observeUntil(selector, () => {
      if (hasClicked || pending) return;
      const closeElement = document.querySelector(elementToClick);
      if (isClickable(closeElement)) {
        pending = true;
        setTimeout(() => {
          pending = false;
          if (isClickable(closeElement) && Array.from(document.querySelectorAll(selector)).some((element) => isVisible(element))) {
            hasClicked = true;
            closeElement.click();
          }
        }, getClickDelay(delay));
      }
    }, { timeout, once });
  }
  function spacebarToClick(selectors) {
    document.addEventListener("keydown", (e) => {
      if (e.key !== " " && e.code !== "Space") return;
      if (e.defaultPrevented || e.repeat || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select, button, a[href], [role="button"], [contenteditable]:not([contenteditable="false"])')) return;
      for (const { selector, triggerSelector } of selectors) {
        if (triggerSelector && !Array.from(document.querySelectorAll(triggerSelector)).some((element) => isVisible(element))) continue;
        const targets = Array.from(document.querySelectorAll(selector)).filter((element) => isClickable(element));
        if (targets.length !== 1) continue;
        const [el] = targets;
        const rect = el.getBoundingClientRect();
        const posX = rect.left + rect.width / 2;
        const posY = rect.top + rect.height / 2;
        if (!el.contains(document.elementFromPoint(posX, posY))) continue;
        e.preventDefault();
        el.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          clientX: posX,
          clientY: posY,
          screenX: posX,
          screenY: posY
        }));
        return;
      }
    });
  }

  // src/modules/ads/RemoveADs.ts
  var RemoveADs = class extends HHModule {
    constructor() {
      const baseKey = "removeADs";
      const configSchema = {
        baseKey,
        default: false,
        label: `Remove ADs from the game`,
        subSettings: [{
          key: "close_home",
          label: `Close ADs in homepage. Keep kobans collecting`,
          default: false
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/activities.html") || /\/quest\/\d+$/.test(currentPage) || currentPage.includes("/boss-bang-battle.html") || currentPage.includes("/champions-map.html") || currentPage.includes("/god-path.html") || /\/characters\/\d+$/.test(currentPage) || currentPage.includes("/home.html") || currentPage.includes("/labyrinth.html") || currentPage.includes("/labyrinth-battle.html") || currentPage.includes("/labyrinth-pre-battle.html") || currentPage.includes("/league-battle.html") || currentPage.includes("/love-raids.html") || currentPage.includes("/pantheon-battle.html") || currentPage.includes("/season.html") || currentPage.includes("/season-battle.html") || currentPage.includes("/shop.html") || currentPage.includes("/troll-battle.html") || currentPage.includes("/world-boss-battle.html");
    }
    run({ close_home }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      if (currentPage.includes("/activities.html")) {
        hideWhenSelectorAvailable(".ad-revive-container", { once: false });
        removeClassWhenSelectorAvailable(".height-for-ad", "height-for-ad", { once: false });
      } else if (/\/quest\/\d+$/.test(currentPage)) {
        hideWhenSelectorAvailable("#ad_quest");
      } else if (currentPage.includes("/boss-bang-battle.html")) {
        hideWhenSelectorAvailable("#ad_battle");
      } else if (currentPage.includes("/champions-map.html")) {
        hideWhenSelectorAvailable("#ad_champions_map");
      } else if (currentPage.includes("/god-path.html")) {
        hideWhenSelectorAvailable("#ad_god-path");
      } else if (/\/characters\/\d+$/.test(currentPage)) {
        hideWhenSelectorAvailable("#ad_harem");
      } else if (currentPage.includes("/home.html")) {
        if (close_home) clickWhenSelectorAvailable(".become-member-text", "close", { delay: [500, 1500], once: false });
      } else if (currentPage.includes("/labyrinth.html")) {
        hideWhenSelectorAvailable("#ad_labyrinth", { once: false, timeout: null });
      } else if (currentPage.includes("/labyrinth-battle.html")) {
        hideWhenSelectorAvailable("#ad_battle");
      } else if (currentPage.includes("/labyrinth-pre-battle.html")) {
        hideWhenSelectorAvailable("#ad_labyrinth-pre-battle", { once: false });
      } else if (currentPage.includes("/league-battle.html")) {
        hideWhenSelectorAvailable("#ad_battle");
      } else if (currentPage.includes("/love-raids.html")) {
        hideWhenSelectorAvailable("#ad_love_raids");
        removeClassWhenSelectorAvailable(".height-for-ad", "height-for-ad", { once: false });
      } else if (currentPage.includes("/pantheon-battle.html")) {
        hideWhenSelectorAvailable("#ad_battle");
      } else if (currentPage.includes("/season.html")) {
        hideWhenSelectorAvailable("#ad_season");
      } else if (currentPage.includes("/season-battle.html")) {
        hideWhenSelectorAvailable("#ad_battle");
      } else if (currentPage.includes("/shop.html")) {
        hideWhenSelectorAvailable("#ad_shop");
      } else if (currentPage.includes("/troll-battle.html")) {
        hideWhenSelectorAvailable("#ad_battle");
      } else if (currentPage.includes("/world-boss-battle.html")) {
        hideWhenSelectorAvailable("#ad_battle");
      }
      this.hasRun = true;
    }
  };

  // src/modules/popups/HidePopups.ts
  var HidePopups = class extends HHModule {
    constructor() {
      const baseKey = "hidePopups";
      const configSchema = {
        baseKey,
        default: false,
        label: `<span tooltip="Dismisses these popups if they open during the first 2 seconds. Use either this or 'Close popups from'.">Hide shop and news popups from the homepage</span>`
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/home.html");
    }
    run() {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      closeTargetWhenTriggerAvailableInsideContainer("#no_HC", { timeout: 2e3 });
      closeTargetWhenTriggerAvailableInsideContainer("#news_details_popup", { targetSelector: ".back_button", timeout: 2e3 });
      closeTargetWhenTriggerAvailableInsideContainer("#popup_news", { timeout: 2e3 });
      this.hasRun = true;
    }
  };

  // src/modules/popups/ClosePopups.ts
  var ClosePopups = class extends HHModule {
    constructor() {
      const baseKey = "closePopups";
      const configSchema = {
        baseKey,
        default: false,
        label: `<span tooltip="more precise and you can select all the options you want. looks for 2 seconds and makes a click on the X to close after a random 250-300 ms. use either this OR the 'Hide' one">Close popups from:</span>`,
        subSettings: [{
          key: "homepage",
          label: `Homepage`,
          default: true
        }, {
          key: "season",
          label: `Season`,
          default: true
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/home.html") || currentPage.includes("/season.html");
    }
    run({ homepage, season }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      if (currentPage.includes("/home.html") && homepage) {
        closeTargetWhenTriggerAvailableInsideContainer("#no_HC", { timeout: 2e3, delay: [250, 300] });
        closeTargetWhenTriggerAvailableInsideContainer("#news_details_popup", { targetSelector: ".back_button", timeout: 2e3, delay: [250, 300] });
        closeTargetWhenTriggerAvailableInsideContainer("#popup_news", { timeout: 2e3, delay: [250, 300] });
        closeTargetWhenTriggerAvailableInsideContainer("#trial_monthly_card_popup", { timeout: 2e3, delay: [250, 300] });
        closeTargetWhenTriggerAvailableInsideContainer("#unique_deal_popup", { timeout: 2e3, delay: [250, 300] });
      } else if (currentPage.includes("/season.html") && season) {
        closeTargetWhenTriggerAvailableInsideContainer("#pass_reminder_popup", { timeout: 2e3, delay: [250, 300] });
      }
      this.hasRun = true;
    }
  };

  // src/modules/battles/AutoConfirm.ts
  var AutoConfirm = class extends HHModule {
    constructor() {
      const baseKey = "autoConfirm";
      const configSchema = {
        baseKey,
        default: false,
        label: `Close specific on screen windows:`,
        subSettings: [{
          key: "daddyrinthRelic",
          label: `Daddyrinth relic confirmation`,
          default: false
        }, {
          key: "leagueWin",
          label: `League win confirmation`,
          default: false
          // }, {
          //     key: 'leagueLoss',
          //     label: `League loss confirmation`,
          //     default: false
        }, {
          key: "pantheonLoss",
          label: `Pantheon loss confirmation`,
          default: false
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/labyrinth.html") || currentPage.includes("/leagues.html") || currentPage.includes("/league-battle.html") || currentPage.includes("/pantheon-battle.html");
    }
    run({ daddyrinthRelic, leagueWin, pantheonLoss }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      if (currentPage.includes("/labyrinth.html") && daddyrinthRelic) {
        closeTargetWhenTriggerAvailableInsideContainer("#labyrinth_reward_popup", { targetSelector: "#close-relic-popup", timeout: null, delay: [50, 150] });
      } else if ((currentPage.includes("/leagues.html") || currentPage.includes("/league-battle.html")) && leagueWin) {
        closeTargetWhenTriggerAvailableInsideContainer("#rewards_popup", { triggerSelector: "#reward_holder", targetSelector: rewardButton, once: false, timeout: null, delay: [50, 150] });
      } else if (currentPage.includes("/pantheon-battle.html") && pantheonLoss) {
        closeTargetWhenTriggerAvailableInsideContainer("#rewards_popup", { triggerSelector: ".lost-first-row", targetSelector: rewardButton, timeout: null, delay: [50, 150] });
      }
      this.hasRun = true;
    }
  };

  // src/modules/keyboard/SpacebarHelp.ts
  var SpacebarHelp = class extends HHModule {
    constructor() {
      const baseKey = "spacebarHelp";
      const configSchema = {
        baseKey,
        default: false,
        label: `Use spacebar to close:`,
        subSettings: [{
          key: "daddyrinthRelic",
          label: `Daddyrinth flow confirmations`,
          default: false
        }, {
          key: "daddyrinthBattle",
          label: `Daddyrinth MM-perform_and_skip, rewards (only if won)`,
          default: false
        }, {
          key: "leagueBattle",
          label: `League battle confirmation`,
          default: false
        }, {
          key: "activitiesReward",
          label: `Rewards in Activities page`,
          default: false
        }]
      };
      super({ name: baseKey, configSchema });
    }
    shouldRun() {
      return currentPage.includes("/labyrinth.html") || currentPage.includes("/labyrinth-pre-battle.html") || currentPage.includes("/labyrinth-battle.html") || currentPage.includes("/leagues.html") || currentPage.includes("/league-battle.html") || currentPage.includes("/activities.html");
    }
    run({ daddyrinthRelic, daddyrinthBattle, leagueBattle, activitiesReward }) {
      if (this.hasRun || !this.shouldRun()) {
        return;
      }
      if (currentPage.includes("/labyrinth.html") && daddyrinthRelic) {
        spacebarToClick([
          { selector: "#labyrinth_reward_popup #close-relic-popup" },
          { selector: `#rewards_popup ${rewardButton}` },
          { selector: "#heal_girl_labyrinth_popup button.blue_button_L" }
        ]);
      } else if ((currentPage.includes("/labyrinth-pre-battle.html") || currentPage.includes("/labyrinth-battle.html")) && daddyrinthBattle) {
        spacebarToClick([
          { selector: `#rewards_popup ${rewardButton}`, triggerSelector: "#rewards_popup #reward_holder" },
          { selector: "#pre-battle .blue_button_L:nth-of-type(2)" }
        ]);
      } else if ((currentPage.includes("/leagues.html") || currentPage.includes("/league-battle.html")) && leagueBattle) {
        spacebarToClick([{ selector: `#rewards_popup ${rewardButton}` }]);
      } else if (currentPage.includes("/activities.html") && activitiesReward) {
        spacebarToClick([{ selector: `#rewards_popup ${rewardButton}` }]);
      }
      this.hasRun = true;
    }
  };

  // src/index.ts
  function runUltron() {
    const { $: $2 } = window;
    if (!$2) {
      console.log("WARNING: No jQuery found. Probably an error page. Ending the script here");
      return;
    }
    initGame($2);
    injectStyles();
    const allModules = [
      new RemoveADs(),
      new HidePopups(),
      new ClosePopups(),
      new AutoConfirm(),
      new SpacebarHelp()
    ];
    setTimeout(() => {
      const runScript = () => {
        const { hhPlusPlusConfig } = window;
        if (!hhPlusPlusConfig) return;
        hhPlusPlusConfig.registerGroup({
          key: "Ultron",
          name: `HH Ultron <small class="ultron-version">v${"0.3.9 testing"}</small>`
        });
        allModules.forEach((module) => {
          hhPlusPlusConfig.registerModule(module);
        });
        hhPlusPlusConfig.loadConfig();
        hhPlusPlusConfig.runModules();
        packSettings();
      };
      if (window.hhPlusPlusConfig) {
        runScript();
      } else {
        $2(document).one("hh++-bdsm:loaded", runScript);
      }
    }, 1);
  }
  runUltron();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzLmNzcyIsICJzcmMvc2V0dGluZ3MudHMiLCAic3JjL0hITW9kdWxlLnRzIiwgInNyYy9kb20udHMiLCAic3JjL21vZHVsZXMvYWRzL1JlbW92ZUFEcy50cyIsICJzcmMvbW9kdWxlcy9wb3B1cHMvSGlkZVBvcHVwcy50cyIsICJzcmMvbW9kdWxlcy9wb3B1cHMvQ2xvc2VQb3B1cHMudHMiLCAic3JjL21vZHVsZXMvYmF0dGxlcy9BdXRvQ29uZmlybS50cyIsICJzcmMvbW9kdWxlcy9rZXlib2FyZC9TcGFjZWJhckhlbHAudHMiLCAic3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgbGV0ICQ6IEpRdWVyeVN0YXRpYztcbmV4cG9ydCBsZXQgY3VycmVudFBhZ2U6IHN0cmluZztcbmV4cG9ydCBjb25zdCByZXdhcmRCdXR0b24gPSAnYnV0dG9uLmJsdWVfYnV0dG9uX0xbY29uZmlybV9ibHVlX2J1dHRvbl0nO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEdhbWUoalF1ZXJ5OiBKUXVlcnlTdGF0aWMpIHtcbiAgICAkID0galF1ZXJ5O1xuICAgIGN1cnJlbnRQYWdlID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xufVxuIiwgIi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJVbHRyb25cIl0gLnBhbmVsLWNvbnRlbnRzIHtcbiAgICBhbGlnbi1jb250ZW50OiBzdGFydDtcbiAgICBhbGlnbi1pdGVtczogc3RhcnQ7XG4gICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICBvdmVyc2Nyb2xsLWJlaGF2aW9yOiBjb250YWluO1xuICAgIHNjcm9sbGJhci13aWR0aDogdGhpbjtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsOmhhcyg+IC5ncm91cC1wYW5lbFtyZWw9XCJVbHRyb25cIl0uc2hvd24pIHtcbiAgICBvdmVyZmxvdzogY2xpcDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJVbHRyb25cIl0gLmNvbmZpZy1zZXR0aW5nLmhhcy1zdWJzZXR0aW5ncyB7XG4gICAgZ3JpZC1yb3ctZW5kOiBhdXRvO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIlVsdHJvblwiXSAudWx0cm9uLXBhY2tlZC1zZXR0aW5ncyB7XG4gICAgZ3JpZC1hdXRvLWZsb3c6IHJvdyBkZW5zZTtcbiAgICBncmlkLWF1dG8tcm93czogMXB4O1xuICAgIHJvdy1nYXA6IDA7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiVWx0cm9uXCJdIC51bHRyb24tcGFja2VkLXNldHRpbmdzIC5jb25maWctc2V0dGluZyB7XG4gICAgZ3JpZC1yb3ctZW5kOiBzcGFuIHZhcigtLXVsdHJvbi1zZXR0aW5nLXJvd3MsIDEpO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLnVsdHJvbi12ZXJzaW9uIHtcbiAgICBmb250LXNpemU6IC42NmVtO1xuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgb3BhY2l0eTogLjg7XG59XG4iLCAiaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IGNzcyBmcm9tICcuL3NldHRpbmdzLmNzcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RTdHlsZXMoKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlLmNsYXNzTmFtZSA9ICdoaC11bHRyb24tc3R5bGUnO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gY3NzO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1NldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiVWx0cm9uXCJdIC5wYW5lbC1jb250ZW50cyc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFwYW5lbCkgcmV0dXJuO1xuICAgICAgICBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaC1zY3JvbGwnKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB8fCAhcGFuZWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCB1bml0ID0gZXZlbnQuZGVsdGFNb2RlID09PSAxID8gMTYgOiBldmVudC5kZWx0YU1vZGUgPT09IDIgPyBwYW5lbC5jbGllbnRIZWlnaHQgOiAxO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBwYW5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgLyBwYW5lbC5vZmZzZXRIZWlnaHQgfHwgMTtcbiAgICAgICAgICAgIHBhbmVsLnNjcm9sbFRvcCArPSBldmVudC5kZWx0YVkgKiB1bml0IC8gc2NhbGU7XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogZmFsc2UgfSk7XG5cbiAgICAgICAgY29uc3QgY2FyZHMgPSBwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbmZpZy1zZXR0aW5nJyk7XG4gICAgICAgIGNvbnN0IHBhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBhbmVsLm9mZnNldFdpZHRoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuICAgICAgICAgICAgICAgIGNhcmQuc3R5bGUuc2V0UHJvcGVydHkoJy0tdWx0cm9uLXNldHRpbmctcm93cycsIFN0cmluZyhjYXJkLm9mZnNldEhlaWdodCArIDEwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QuYWRkKCd1bHRyb24tcGFja2VkLXNldHRpbmdzJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGdyb3VwT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihwYWNrKTtcbiAgICAgICAgaWYgKHBhbmVsLnBhcmVudEVsZW1lbnQpIGdyb3VwT2JzZXJ2ZXIub2JzZXJ2ZShwYW5lbC5wYXJlbnRFbGVtZW50LCB7IGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcyddIH0pO1xuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc3Qgc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHBhY2spO1xuICAgICAgICAgICAgY2FyZHMuZm9yRWFjaChjYXJkID0+IHNpemVPYnNlcnZlci5vYnNlcnZlKGNhcmQpKTtcbiAgICAgICAgfVxuICAgICAgICBwYWNrKCk7XG4gICAgfSk7XG59XG4iLCAiZXhwb3J0IHR5cGUgTW9kdWxlU2V0dGluZ3MgPSBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcblxuaW50ZXJmYWNlIENvbmZpZ1NjaGVtYSB7XG4gICAgYmFzZUtleTogc3RyaW5nO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgZGVmYXVsdDogYm9vbGVhbjtcbiAgICBzdWJTZXR0aW5ncz86IHsga2V5OiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGRlZmF1bHQ6IGJvb2xlYW4gfVtdO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSEhNb2R1bGUge1xuICAgIHJlYWRvbmx5IGdyb3VwID0gJ1VsdHJvbic7XG4gICAgcmVhZG9ubHkgY29uZmlnU2NoZW1hOiBDb25maWdTY2hlbWE7XG4gICAgaGFzUnVuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcih7IGNvbmZpZ1NjaGVtYSB9OiB7IG5hbWU6IHN0cmluZzsgY29uZmlnU2NoZW1hOiBDb25maWdTY2hlbWEgfSkge1xuICAgICAgICB0aGlzLmNvbmZpZ1NjaGVtYSA9IGNvbmZpZ1NjaGVtYTtcbiAgICB9XG5cbiAgICBhYnN0cmFjdCBzaG91bGRSdW4oKTogYm9vbGVhbjtcbiAgICBhYnN0cmFjdCBydW4oc2V0dGluZ3M6IE1vZHVsZVNldHRpbmdzKTogdm9pZCB8IFByb21pc2U8dm9pZD47XG59XG4iLCAiaW50ZXJmYWNlIE9ic2VydmVyT3B0aW9ucyB7XG4gICAgb25jZT86IGJvb2xlYW47XG4gICAgdGltZW91dD86IG51bWJlciB8IG51bGw7XG59XG5cbnR5cGUgQ2xpY2tEZWxheSA9IG51bWJlciB8IFtudW1iZXIsIG51bWJlcl07XG5pbnRlcmZhY2UgQ2xpY2tPcHRpb25zIGV4dGVuZHMgT2JzZXJ2ZXJPcHRpb25zIHtcbiAgICBkZWxheT86IENsaWNrRGVsYXk7XG59XG5cbmludGVyZmFjZSBQb3B1cE9wdGlvbnMgZXh0ZW5kcyBDbGlja09wdGlvbnMge1xuICAgIHRyaWdnZXJTZWxlY3Rvcj86IHN0cmluZztcbiAgICB0YXJnZXRTZWxlY3Rvcj86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gb2JzZXJ2ZVVudGlsKHNlbGVjdG9yOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+KSA9PiB2b2lkLFxuICAgIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH06IE9ic2VydmVyT3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgaWYgKG9uY2UpIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICAgIC8vIFBhc3MgYHRpbWVvdXQ6IG51bGxgIChvciBhbnkgbm9uLWZpbml0ZSB2YWx1ZSkgdG8gZGlzYWJsZSB0aGUgdGltZW91dFxuICAgIGlmICh0aW1lb3V0ICE9PSBudWxsICYmIE51bWJlci5pc0Zpbml0ZSh0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yOiBzdHJpbmcsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH06IE9ic2VydmVyT3B0aW9ucyA9IHt9KSB7XG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yLCAoZWxlbWVudHMpID0+IHtcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9KTtcbiAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG59XG5cbmZ1bmN0aW9uIGlzVmlzaWJsZTxUIGV4dGVuZHMgRWxlbWVudD4oZWw6IFQgfCBudWxsKTogZWwgaXMgVCB7XG4gICAgcmV0dXJuICEhKGVsPy5pc0Nvbm5lY3RlZCAmJiBlbC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCAmJlxuICAgICAgICAhZWwuY2xvc2VzdCgnW2hpZGRlbl0sIFtpbmVydF0sIFthcmlhLWhpZGRlbj1cInRydWVcIl0nKSAmJiBnZXRDb21wdXRlZFN0eWxlKGVsKS52aXNpYmlsaXR5ID09PSAndmlzaWJsZScpO1xufVxuXG5mdW5jdGlvbiBpc0NsaWNrYWJsZTxUIGV4dGVuZHMgRWxlbWVudD4oZWw6IFQgfCBudWxsKTogZWwgaXMgVCB7XG4gICAgcmV0dXJuIGlzVmlzaWJsZShlbCkgJiYgIWVsLm1hdGNoZXMoJzpkaXNhYmxlZCwgLmRpc2FibGVkLCBbYXJpYS1kaXNhYmxlZD1cInRydWVcIl0nKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2xpY2tEZWxheShkZWxheTogQ2xpY2tEZWxheSkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KGRlbGF5KVxuICAgICAgICA/IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChkZWxheVsxXSAtIGRlbGF5WzBdICsgMSkpICsgZGVsYXlbMF1cbiAgICAgICAgOiBkZWxheTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyxcbiAgICB7IHRyaWdnZXJTZWxlY3RvciwgdGFyZ2V0U2VsZWN0b3IgPSAnLmNsb3NhYmxlJywgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwLCBkZWxheSA9IDAgfTogUG9wdXBPcHRpb25zID0ge30pIHtcbiAgICBsZXQgY29udGFpbmVyOiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGFjdGl2ZVBvcHVwOiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGNsaWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgcGVuZGluZzogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGV4cGlyeTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgZ2V0QWN0aXZlUG9wdXAgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgIGlmICghaXNWaXNpYmxlKHBvcHVwKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICh0cmlnZ2VyU2VsZWN0b3IgJiYgIUFycmF5LmZyb20ocG9wdXAucXVlcnlTZWxlY3RvckFsbCh0cmlnZ2VyU2VsZWN0b3IpKS5zb21lKGVsZW1lbnQgPT4gaXNWaXNpYmxlKGVsZW1lbnQpKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBwb3B1cDtcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0VGFyZ2V0ID0gKHBvcHVwOiBFbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSBBcnJheS5mcm9tKHBvcHVwLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KHRhcmdldFNlbGVjdG9yKSkuZmlsdGVyKGVsZW1lbnQgPT4gaXNDbGlja2FibGUoZWxlbWVudCkpO1xuICAgICAgICByZXR1cm4gdGFyZ2V0cy5sZW5ndGggPT09IDEgPyB0YXJnZXRzWzBdIDogbnVsbDtcbiAgICB9O1xuXG4gICAgY29uc3QgY2hlY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICBjb25zdCBwb3B1cCA9IGdldEFjdGl2ZVBvcHVwKCk7XG4gICAgICAgIGlmIChwb3B1cCAhPT0gYWN0aXZlUG9wdXApIHtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nICE9PSBudWxsKSBjbGVhclRpbWVvdXQocGVuZGluZyk7XG4gICAgICAgICAgICBwZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgIGNsaWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGFjdGl2ZVBvcHVwID0gcG9wdXA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwb3B1cCB8fCBjbGlja2VkIHx8IHBlbmRpbmcgIT09IG51bGwgfHwgIWdldFRhcmdldChwb3B1cCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBjbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgIHBlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGdldEFjdGl2ZVBvcHVwKCkgIT09IHBvcHVwKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXRUYXJnZXQocG9wdXApO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpIHJldHVybjtcblxuICAgICAgICAgICAgY2xpY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoZXhwaXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhcmdldC5jbGljaygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGNvbXB1dGVkRGVsYXkgPSBnZXRDbGlja0RlbGF5KGRlbGF5KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkRGVsYXkgPiAwKSBwZW5kaW5nID0gc2V0VGltZW91dChjbGljaywgY29tcHV0ZWREZWxheSk7XG4gICAgICAgIGVsc2UgY2xpY2soKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGN1cnJlbnQgIT09IGNvbnRhaW5lciB8fCAoY3VycmVudCAmJiBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT4gY3VycmVudC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhjdXJyZW50KSkpKSBjaGVjaygpO1xuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJywgJ3N0eWxlJywgJ2hpZGRlbicsICdpbmVydCcsICdhcmlhLWhpZGRlbicsICdkaXNhYmxlZCcsICdhcmlhLWRpc2FibGVkJ11cbiAgICB9KTtcbiAgICBpZiAodGltZW91dCAhPT0gbnVsbCAmJiBOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIGV4cGlyeSA9IHNldFRpbWVvdXQoKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpLCB0aW1lb3V0KTtcbiAgICBjaGVjaygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3I6IHN0cmluZywgY2xhc3NUb1JlbW92ZTogc3RyaW5nLFxuICAgIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH06IE9ic2VydmVyT3B0aW9ucyA9IHt9KSB7XG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yLCAoZWxlbWVudHMpID0+IHtcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzVG9SZW1vdmUpKTtcbiAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGlja1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCBlbGVtZW50VG9DbGljazogc3RyaW5nLFxuICAgIHsgZGVsYXkgPSAyMDAwLCBvbmNlID0gdHJ1ZSwgdGltZW91dCA9IDUwMDAgfTogQ2xpY2tPcHRpb25zID0ge30pIHtcbiAgICBsZXQgcGVuZGluZyA9IGZhbHNlO1xuICAgIGxldCBoYXNDbGlja2VkID0gZmFsc2U7XG5cbiAgICBvYnNlcnZlVW50aWwoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgaWYgKGhhc0NsaWNrZWQgfHwgcGVuZGluZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNsb3NlRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KGVsZW1lbnRUb0NsaWNrKTtcbiAgICAgICAgaWYgKGlzQ2xpY2thYmxlKGNsb3NlRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHBlbmRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDbGlja2FibGUoY2xvc2VFbGVtZW50KSAmJiBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKS5zb21lKGVsZW1lbnQgPT4gaXNWaXNpYmxlKGVsZW1lbnQpKSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNDbGlja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VFbGVtZW50LmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZ2V0Q2xpY2tEZWxheShkZWxheSkpO1xuICAgICAgICB9XG4gICAgfSwgeyB0aW1lb3V0LCBvbmNlIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BhY2ViYXJUb0NsaWNrKHNlbGVjdG9yczogeyBzZWxlY3Rvcjogc3RyaW5nOyB0cmlnZ2VyU2VsZWN0b3I/OiBzdHJpbmcgfVtdKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICAgIGlmIChlLmtleSAhPT0gJyAnICYmIGUuY29kZSAhPT0gJ1NwYWNlJykgcmV0dXJuO1xuICAgICAgICBpZiAoZS5kZWZhdWx0UHJldmVudGVkIHx8IGUucmVwZWF0IHx8IGUuaXNDb21wb3NpbmcgfHwgZS5hbHRLZXkgfHwgZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG4gICAgICAgIGlmIChlLnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgJiZcbiAgICAgICAgICAgIGUudGFyZ2V0LmNsb3Nlc3QoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBidXR0b24sIGFbaHJlZl0sIFtyb2xlPVwiYnV0dG9uXCJdLCBbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKScpKSByZXR1cm47XG5cbiAgICAgICAgZm9yIChjb25zdCB7IHNlbGVjdG9yLCB0cmlnZ2VyU2VsZWN0b3IgfSBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGlmICh0cmlnZ2VyU2VsZWN0b3IgJiYgIUFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0cmlnZ2VyU2VsZWN0b3IpKS5zb21lKGVsZW1lbnQgPT4gaXNWaXNpYmxlKGVsZW1lbnQpKSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkuZmlsdGVyKGVsZW1lbnQgPT4gaXNDbGlja2FibGUoZWxlbWVudCkpO1xuICAgICAgICAgICAgaWYgKHRhcmdldHMubGVuZ3RoICE9PSAxKSBjb250aW51ZTtcblxuICAgICAgICAgICAgY29uc3QgW2VsXSA9IHRhcmdldHM7XG4gICAgICAgICAgICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCBwb3NYID0gcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCAvIDI7XG4gICAgICAgICAgICBjb25zdCBwb3NZID0gcmVjdC50b3AgKyByZWN0LmhlaWdodCAvIDI7XG4gICAgICAgICAgICBpZiAoIWVsLmNvbnRhaW5zKGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQocG9zWCwgcG9zWSkpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7XG4gICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjbGllbnRYOiBwb3NYLCBjbGllbnRZOiBwb3NZLFxuICAgICAgICAgICAgICAgIHNjcmVlblg6IHBvc1gsIHNjcmVlblk6IHBvc1l9KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsICJpbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSwgcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUsIGNsaWNrV2hlblNlbGVjdG9yQXZhaWxhYmxlIH0gZnJvbSAnLi4vLi4vZG9tJztcblxuZXhwb3J0IGNsYXNzIFJlbW92ZUFEcyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdyZW1vdmVBRHMnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBgUmVtb3ZlIEFEcyBmcm9tIHRoZSBnYW1lYCxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2Nsb3NlX2hvbWUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgQ2xvc2UgQURzIGluIGhvbWVwYWdlLiBLZWVwIGtvYmFucyBjb2xsZWN0aW5nYCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKSB8fFxuICAgICAgICAoL1xcL3F1ZXN0XFwvXFxkKyQvLnRlc3QoY3VycmVudFBhZ2UpKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2Jvc3MtYmFuZy1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvY2hhbXBpb25zLW1hcC5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9nb2QtcGF0aC5odG1sJykgfHxcbiAgICAgICAgKC9cXC9jaGFyYWN0ZXJzXFwvXFxkKyQvLnRlc3QoY3VycmVudFBhZ2UpKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2hvbWUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLXByZS1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3VlLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhbnRoZW9uLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9zZWFzb24uaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvc2Vhc29uLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9zaG9wLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3Ryb2xsLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy93b3JsZC1ib3NzLWJhdHRsZS5odG1sJylcbiAgICB9XG5cbiAgICBydW4oeyBjbG9zZV9ob21lIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnLmFkLXJldml2ZS1jb250YWluZXInLCB7IG9uY2U6IGZhbHNlIH0pO1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUoJy5oZWlnaHQtZm9yLWFkJywgJ2hlaWdodC1mb3ItYWQnLCB7IG9uY2U6IGZhbHNlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKC9cXC9xdWVzdFxcL1xcZCskLy50ZXN0KGN1cnJlbnRQYWdlKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX3F1ZXN0Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ib3NzLWJhbmctYmF0dGxlLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2JhdHRsZScpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvY2hhbXBpb25zLW1hcC5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9jaGFtcGlvbnNfbWFwJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9nb2QtcGF0aC5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9nb2QtcGF0aCcpO1xuICAgICAgICB9IGVsc2UgaWYgKC9cXC9jaGFyYWN0ZXJzXFwvXFxkKyQvLnRlc3QoY3VycmVudFBhZ2UpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfaGFyZW0nKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2hvbWUuaHRtbCcpKSB7XG4gICAgICAgICAgICBpZiAoY2xvc2VfaG9tZSkgY2xpY2tXaGVuU2VsZWN0b3JBdmFpbGFibGUoJy5iZWNvbWUtbWVtYmVyLXRleHQnLCAnY2xvc2UnLCB7IGRlbGF5OiBbNTAwLCAxNTAwXSwgb25jZTogZmFsc2UgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGguaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfbGFieXJpbnRoJywgeyBvbmNlOiBmYWxzZSwgdGltZW91dDogbnVsbCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC1iYXR0bGUuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfYmF0dGxlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGgtcHJlLWJhdHRsZS5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9sYWJ5cmludGgtcHJlLWJhdHRsZScsIHsgb25jZTogZmFsc2UgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWUtYmF0dGxlLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2JhdHRsZScpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9sb3ZlX3JhaWRzJyk7XG4gICAgICAgICAgICByZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSgnLmhlaWdodC1mb3ItYWQnLCAnaGVpZ2h0LWZvci1hZCcsIHsgb25jZTogZmFsc2UgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYW50aGVvbi1iYXR0bGUuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfYmF0dGxlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9zZWFzb24uaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfc2Vhc29uJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9zZWFzb24tYmF0dGxlLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2JhdHRsZScpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvc2hvcC5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9zaG9wJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy90cm9sbC1iYXR0bGUuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfYmF0dGxlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy93b3JsZC1ib3NzLWJhdHRsZS5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9iYXR0bGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyIH0gZnJvbSAnLi4vLi4vZG9tJztcblxuZXhwb3J0IGNsYXNzIEhpZGVQb3B1cHMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnaGlkZVBvcHVwcydcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IGA8c3BhbiB0b29sdGlwPVwiRGlzbWlzc2VzIHRoZXNlIHBvcHVwcyBpZiB0aGV5IG9wZW4gZHVyaW5nIHRoZSBmaXJzdCAyIHNlY29uZHMuIFVzZSBlaXRoZXIgdGhpcyBvciAnQ2xvc2UgcG9wdXBzIGZyb20nLlwiPkhpZGUgc2hvcCBhbmQgbmV3cyBwb3B1cHMgZnJvbSB0aGUgaG9tZXBhZ2U8L3NwYW4+YCxcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ob21lLmh0bWwnKVxuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNub19IQycsIHsgdGltZW91dDogMjAwMCB9KTtcbiAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI25ld3NfZGV0YWlsc19wb3B1cCcsIHsgdGFyZ2V0U2VsZWN0b3I6ICcuYmFja19idXR0b24nLCB0aW1lb3V0OiAyMDAwIH0pO1xuICAgICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjcG9wdXBfbmV3cycsIHsgdGltZW91dDogMjAwMCB9KTtcblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIgfSBmcm9tICcuLi8uLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgQ2xvc2VQb3B1cHMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnY2xvc2VQb3B1cHMnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBgPHNwYW4gdG9vbHRpcD1cIm1vcmUgcHJlY2lzZSBhbmQgeW91IGNhbiBzZWxlY3QgYWxsIHRoZSBvcHRpb25zIHlvdSB3YW50LiBsb29rcyBmb3IgMiBzZWNvbmRzIGFuZCBtYWtlcyBhIGNsaWNrIG9uIHRoZSBYIHRvIGNsb3NlIGFmdGVyIGEgcmFuZG9tIDI1MC0zMDAgbXMuIHVzZSBlaXRoZXIgdGhpcyBPUiB0aGUgJ0hpZGUnIG9uZVwiPkNsb3NlIHBvcHVwcyBmcm9tOjwvc3Bhbj5gLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnaG9tZXBhZ2UnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgSG9tZXBhZ2VgLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdzZWFzb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgU2Vhc29uYCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ob21lLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3NlYXNvbi5odG1sJylcbiAgICB9XG5cbiAgICBydW4oeyBob21lcGFnZSwgc2Vhc29uIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ob21lLmh0bWwnKSAmJiBob21lcGFnZSkge1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI25vX0hDJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI25ld3NfZGV0YWlsc19wb3B1cCcsIHsgdGFyZ2V0U2VsZWN0b3I6ICcuYmFja19idXR0b24nLCB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3BvcHVwX25ld3MnLCB7IHRpbWVvdXQ6IDIwMDAsIGRlbGF5OiBbMjUwLDMwMF0gfSk7XG4gICAgICAgICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjdHJpYWxfbW9udGhseV9jYXJkX3BvcHVwJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3VuaXF1ZV9kZWFsX3BvcHVwJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvc2Vhc29uLmh0bWwnKSAmJiBzZWFzb24pIHtcbiAgICAgICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNwYXNzX3JlbWluZGVyX3BvcHVwJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlLCByZXdhcmRCdXR0b24gfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIgfSBmcm9tICcuLi8uLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgQXV0b0NvbmZpcm0gZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnYXV0b0NvbmZpcm0nXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBgQ2xvc2Ugc3BlY2lmaWMgb24gc2NyZWVuIHdpbmRvd3M6YCxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2RhZGR5cmludGhSZWxpYycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGBEYWRkeXJpbnRoIHJlbGljIGNvbmZpcm1hdGlvbmAsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdsZWFndWVXaW4nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgTGVhZ3VlIHdpbiBjb25maXJtYXRpb25gLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICAvLyB9LCB7XG4gICAgICAgICAgICAvLyAgICAga2V5OiAnbGVhZ3VlTG9zcycsXG4gICAgICAgICAgICAvLyAgICAgbGFiZWw6IGBMZWFndWUgbG9zcyBjb25maXJtYXRpb25gLFxuICAgICAgICAgICAgLy8gICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAncGFudGhlb25Mb3NzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogYFBhbnRoZW9uIGxvc3MgY29uZmlybWF0aW9uYCxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGguaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWUtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhbnRoZW9uLWJhdHRsZS5odG1sJylcbiAgICB9XG5cbiAgICBydW4oeyBkYWRkeXJpbnRoUmVsaWMsIGxlYWd1ZVdpbiwgcGFudGhlb25Mb3NzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGguaHRtbCcpICYmIGRhZGR5cmludGhSZWxpYykge1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI2xhYnlyaW50aF9yZXdhcmRfcG9wdXAnLCB7IHRhcmdldFNlbGVjdG9yOiAnI2Nsb3NlLXJlbGljLXBvcHVwJywgdGltZW91dDogbnVsbCwgZGVsYXk6IFs1MCwxNTBdIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3VlLWJhdHRsZS5odG1sJykpICYmIGxlYWd1ZVdpbikge1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3Jld2FyZHNfcG9wdXAnLCB7IHRyaWdnZXJTZWxlY3RvcjogJyNyZXdhcmRfaG9sZGVyJywgdGFyZ2V0U2VsZWN0b3I6IHJld2FyZEJ1dHRvbiwgb25jZTogZmFsc2UsIHRpbWVvdXQ6IG51bGwsIGRlbGF5OiBbNTAsMTUwXSB9KTtcbiAgICAgICAgLy8gfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3VlLWJhdHRsZS5odG1sJykgJiYgbGVhZ3VlTG9zcykge1xuICAgICAgICAvLyAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3Jld2FyZHNfcG9wdXAnLCB7IHRyaWdnZXJTZWxlY3RvcjogJyN1cGdyYWRlX2NoYXJhY3RlcnMnLCB0YXJnZXRTZWxlY3RvcjogcmV3YXJkQnV0dG9uLCBvbmNlOiBmYWxzZSwgdGltZW91dDogbnVsbCwgZGVsYXk6IFs1MCwxNTBdIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGFudGhlb24tYmF0dGxlLmh0bWwnKSAmJiBwYW50aGVvbkxvc3MpIHtcbiAgICAgICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNyZXdhcmRzX3BvcHVwJywgeyB0cmlnZ2VyU2VsZWN0b3I6ICcubG9zdC1maXJzdC1yb3cnLCB0YXJnZXRTZWxlY3RvcjogcmV3YXJkQnV0dG9uLCB0aW1lb3V0OiBudWxsLCBkZWxheTogWzUwLDE1MF0gfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UsIHJld2FyZEJ1dHRvbiB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgc3BhY2ViYXJUb0NsaWNrIH0gZnJvbSAnLi4vLi4vZG9tJztcblxuZXhwb3J0IGNsYXNzIFNwYWNlYmFySGVscCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdzcGFjZWJhckhlbHAnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBgVXNlIHNwYWNlYmFyIHRvIGNsb3NlOmAsXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdkYWRkeXJpbnRoUmVsaWMnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgRGFkZHlyaW50aCBmbG93IGNvbmZpcm1hdGlvbnNgLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnZGFkZHlyaW50aEJhdHRsZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGBEYWRkeXJpbnRoIE1NLXBlcmZvcm1fYW5kX3NraXAsIHJld2FyZHMgKG9ubHkgaWYgd29uKWAsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdsZWFndWVCYXR0bGUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBgTGVhZ3VlIGJhdHRsZSBjb25maXJtYXRpb25gLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnYWN0aXZpdGllc1Jld2FyZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGBSZXdhcmRzIGluIEFjdGl2aXRpZXMgcGFnZWAsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC1wcmUtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWUtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2FjdGl2aXRpZXMuaHRtbCcpXG4gICAgfVxuXG4gICAgcnVuKHsgZGFkZHlyaW50aFJlbGljLCBkYWRkeXJpbnRoQmF0dGxlLCBsZWFndWVCYXR0bGUsIGFjdGl2aXRpZXNSZXdhcmQgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC5odG1sJykgJiYgZGFkZHlyaW50aFJlbGljKSB7XG4gICAgICAgICAgICBzcGFjZWJhclRvQ2xpY2soW1xuICAgICAgICAgICAgICAgIHsgc2VsZWN0b3I6ICcjbGFieXJpbnRoX3Jld2FyZF9wb3B1cCAjY2xvc2UtcmVsaWMtcG9wdXAnIH0sXG4gICAgICAgICAgICAgICAgeyBzZWxlY3RvcjogYCNyZXdhcmRzX3BvcHVwICR7cmV3YXJkQnV0dG9ufWAgfSxcbiAgICAgICAgICAgICAgICB7IHNlbGVjdG9yOiAnI2hlYWxfZ2lybF9sYWJ5cmludGhfcG9wdXAgYnV0dG9uLmJsdWVfYnV0dG9uX0wnIH1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9IGVsc2UgaWYgKChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC1wcmUtYmF0dGxlLmh0bWwnKSB8fCBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC1iYXR0bGUuaHRtbCcpKSAmJiBkYWRkeXJpbnRoQmF0dGxlKSB7XG4gICAgICAgICAgICBzcGFjZWJhclRvQ2xpY2soW1xuICAgICAgICAgICAgICAgIHsgc2VsZWN0b3I6IGAjcmV3YXJkc19wb3B1cCAke3Jld2FyZEJ1dHRvbn1gLCB0cmlnZ2VyU2VsZWN0b3I6ICcjcmV3YXJkc19wb3B1cCAjcmV3YXJkX2hvbGRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHNlbGVjdG9yOiAnI3ByZS1iYXR0bGUgLmJsdWVfYnV0dG9uX0w6bnRoLW9mLXR5cGUoMiknIH1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9IGVsc2UgaWYgKChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3VlLWJhdHRsZS5odG1sJykpICYmIGxlYWd1ZUJhdHRsZSkge1xuICAgICAgICAgICAgc3BhY2ViYXJUb0NsaWNrKFt7IHNlbGVjdG9yOiBgI3Jld2FyZHNfcG9wdXAgJHtyZXdhcmRCdXR0b259YCB9XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKSAmJiBhY3Rpdml0aWVzUmV3YXJkKSB7XG4gICAgICAgICAgICBzcGFjZWJhclRvQ2xpY2soW3sgc2VsZWN0b3I6IGAjcmV3YXJkc19wb3B1cCAke3Jld2FyZEJ1dHRvbn1gIH1dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBpbml0R2FtZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBpbmplY3RTdHlsZXMsIHBhY2tTZXR0aW5ncyB9IGZyb20gJy4vc2V0dGluZ3MnO1xuaW1wb3J0IHsgUmVtb3ZlQURzIH0gZnJvbSAnLi9tb2R1bGVzL2Fkcy9SZW1vdmVBRHMnO1xuaW1wb3J0IHsgSGlkZVBvcHVwcyB9IGZyb20gJy4vbW9kdWxlcy9wb3B1cHMvSGlkZVBvcHVwcyc7XG5pbXBvcnQgeyBDbG9zZVBvcHVwcyB9IGZyb20gJy4vbW9kdWxlcy9wb3B1cHMvQ2xvc2VQb3B1cHMnO1xuaW1wb3J0IHsgQXV0b0NvbmZpcm0gfSBmcm9tICcuL21vZHVsZXMvYmF0dGxlcy9BdXRvQ29uZmlybSc7XG5pbXBvcnQgeyBTcGFjZWJhckhlbHAgfSBmcm9tICcuL21vZHVsZXMva2V5Ym9hcmQvU3BhY2ViYXJIZWxwJztcblxuZnVuY3Rpb24gcnVuVWx0cm9uKCkge1xuICAgIGNvbnN0IHsgJCB9ID0gd2luZG93O1xuXG4gICAgaWYgKCEkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HOiBObyBqUXVlcnkgZm91bmQuIFByb2JhYmx5IGFuIGVycm9yIHBhZ2UuIEVuZGluZyB0aGUgc2NyaXB0IGhlcmUnKVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpbml0R2FtZSgkKTtcbiAgICBpbmplY3RTdHlsZXMoKTtcblxuICAgIGNvbnN0IGFsbE1vZHVsZXMgPSBbXG4gICAgICAgIG5ldyBSZW1vdmVBRHMoKSxcbiAgICAgICAgbmV3IEhpZGVQb3B1cHMoKSxcbiAgICAgICAgbmV3IENsb3NlUG9wdXBzKCksXG4gICAgICAgIG5ldyBBdXRvQ29uZmlybSgpLFxuICAgICAgICBuZXcgU3BhY2ViYXJIZWxwKClcbiAgICBdXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc3QgcnVuU2NyaXB0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBoaFBsdXNQbHVzQ29uZmlnIH0gPSB3aW5kb3dcbiAgICAgICAgICAgIGlmICghaGhQbHVzUGx1c0NvbmZpZykgcmV0dXJuO1xuXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJlZ2lzdGVyR3JvdXAoe1xuICAgICAgICAgICAgICAgIGtleTogJ1VsdHJvbicsXG4gICAgICAgICAgICAgICAgbmFtZTogYEhIIFVsdHJvbiA8c21hbGwgY2xhc3M9XCJ1bHRyb24tdmVyc2lvblwiPnYke1VTRVJTQ1JJUFRfVkVSU0lPTl9MQUJFTH08L3NtYWxsPmBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBhbGxNb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IHtcbiAgICAgICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJlZ2lzdGVyTW9kdWxlKG1vZHVsZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLmxvYWRDb25maWcoKVxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5ydW5Nb2R1bGVzKClcbiAgICAgICAgICAgIHBhY2tTZXR0aW5ncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5oaFBsdXNQbHVzQ29uZmlnKSB7XG4gICAgICAgICAgICBydW5TY3JpcHQoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub25lKCdoaCsrLWJkc206bG9hZGVkJywgcnVuU2NyaXB0KVxuICAgICAgICB9XG4gICAgfSwgMSlcbn1cblxucnVuVWx0cm9uKCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU8sTUFBSTtBQUNKLE1BQUk7QUFDSixNQUFNLGVBQWU7QUFFckIsV0FBUyxTQUFTLFFBQXNCO0FBQzNDLFFBQUk7QUFDSixrQkFBYyxPQUFPLFNBQVM7QUFBQSxFQUNsQzs7O0FDUEE7OztBQ0dPLFdBQVMsZUFBZTtBQUMzQixVQUFNLFFBQVEsU0FBUyxjQUFjLE9BQU87QUFDNUMsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sY0FBYztBQUNwQixhQUFTLEtBQUssWUFBWSxLQUFLO0FBQUEsRUFDbkM7QUFFTyxXQUFTLGVBQWU7QUFDM0IsUUFBSSxnQkFBZ0IsYUFBYztBQUVsQyxVQUFNLFdBQVc7QUFDakIsV0FBTyxXQUFXLFFBQVEsd0JBQXdCLFVBQVUsTUFBTTtBQUM5RCxZQUFNLFFBQVEsU0FBUyxjQUEyQixRQUFRO0FBQzFELFVBQUksQ0FBQyxNQUFPO0FBQ1osWUFBTSxVQUFVLE9BQU8sV0FBVztBQUNsQyxhQUFPLGlCQUFpQixTQUFTLFdBQVM7QUFDdEMsWUFBSSxNQUFNLFdBQVcsRUFBRSxNQUFNLGtCQUFrQixTQUFTLENBQUMsTUFBTSxTQUFTLE1BQU0sTUFBTSxFQUFHO0FBRXZGLGNBQU0sZUFBZTtBQUNyQixjQUFNLHlCQUF5QjtBQUMvQixjQUFNLE9BQU8sTUFBTSxjQUFjLElBQUksS0FBSyxNQUFNLGNBQWMsSUFBSSxNQUFNLGVBQWU7QUFDdkYsY0FBTSxRQUFRLE1BQU0sc0JBQXNCLEVBQUUsU0FBUyxNQUFNLGdCQUFnQjtBQUMzRSxjQUFN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
