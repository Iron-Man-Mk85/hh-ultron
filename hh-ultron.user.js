// ==UserScript==
// @name           HH Ultron (Dev)
// @version        0.3.10
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

  // src/settingsHelp.ts
  function settingHelp(label, description) {
    const escape = (text) => text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    return escape(label) + ' <span class="ironman-setting-help" role="button" tabindex="0" aria-label="About ' + escape(label) + '" data-setting-help="' + escape(description) + '">?</span>';
  }
  function mountSettingsHelp(panel, tooltipId) {
    const tooltip = document.createElement("div");
    tooltip.id = tooltipId;
    tooltip.className = "ironman-setting-tooltip";
    tooltip.setAttribute("role", "tooltip");
    const popover = typeof tooltip.showPopover === "function";
    if (popover) tooltip.setAttribute("popover", "manual");
    else tooltip.hidden = true;
    document.body.appendChild(tooltip);
    let anchor = null;
    const getHelp = (target) => target instanceof Element ? target.closest("[data-setting-help]") : null;
    const close = () => {
      if (!anchor) return;
      anchor.removeAttribute("aria-describedby");
      anchor = null;
      if (popover) tooltip.hidePopover();
      else tooltip.hidden = true;
    };
    const show = (help) => {
      if (anchor === help) return;
      close();
      anchor = help;
      help.setAttribute("aria-describedby", tooltipId);
      tooltip.textContent = help.dataset.settingHelp ?? "";
      if (popover) tooltip.showPopover();
      else tooltip.hidden = false;
      const bounds = help.getBoundingClientRect();
      const { offsetWidth, offsetHeight } = tooltip;
      tooltip.style.left = Math.max(8, Math.min(bounds.left, document.documentElement.clientWidth - offsetWidth - 8)) + "px";
      const below = bounds.bottom + 6;
      tooltip.style.top = (below + offsetHeight <= window.innerHeight - 8 ? below : Math.max(8, bounds.top - offsetHeight - 6)) + "px";
    };
    panel.addEventListener("pointerover", (event) => {
      const help = getHelp(event.target);
      if (help && event.pointerType !== "touch") show(help);
    });
    panel.addEventListener("pointerout", (event) => {
      const help = getHelp(event.target);
      if (help === anchor && help && document.activeElement !== help) close();
    });
    panel.addEventListener("focusin", (event) => {
      const help = getHelp(event.target);
      if (help) show(help);
    });
    panel.addEventListener("focusout", (event) => {
      if (getHelp(event.target) === anchor) close();
    });
    panel.addEventListener("click", (event) => {
      const help = getHelp(event.target);
      if (!help) return;
      event.preventDefault();
      event.stopPropagation();
      show(help);
    });
    panel.addEventListener("keydown", (event) => {
      const help = getHelp(event.target);
      if (help && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        event.stopPropagation();
        show(help);
      } else if (anchor && event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (getHelp(event.target) !== anchor) close();
    });
    panel.addEventListener("scroll", close, { passive: true });
  }

  // src/settings.css
  var settings_default = '.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .panel-contents {\n    align-content: start;\n    align-items: start;\n    overflow-y: auto;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n}\n.hh-plus-plus-config-panel:has(> .group-panel[rel="Ultron"].shown) {\n    overflow: clip;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .config-setting.has-subsettings {\n    grid-row-end: auto;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .ultron-packed-settings {\n    grid-auto-flow: row dense;\n    grid-auto-rows: 1px;\n    row-gap: 0;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .ultron-packed-settings .config-setting {\n    grid-row-end: span var(--ultron-setting-rows, 1);\n}\n.ironman-setting-help {\n    display: inline-grid;\n    place-items: center;\n    box-sizing: border-box;\n    inline-size: 1.25em;\n    block-size: 1.25em;\n    border: 1px solid currentColor;\n    border-radius: 50%;\n    font-size: .8em;\n    line-height: 1;\n    vertical-align: .08em;\n    cursor: help;\n}\n.ironman-setting-help:hover,\n.ironman-setting-help:focus-visible {\n    outline: 1px solid currentColor;\n    outline-offset: 2px;\n}\n.ironman-setting-tooltip {\n    position: fixed;\n    inset: auto;\n    z-index: 10010;\n    box-sizing: border-box;\n    max-width: min(18rem, calc(100vw - 16px));\n    margin: 0;\n    padding: .5em .7em;\n    border: 1px solid var(--config-setting-border, #a9a3bc);\n    border-radius: .4em;\n    background: var(--config-setting-background, #241e30);\n    color: #fff;\n    font: 14px/1.4 system-ui, sans-serif;\n    pointer-events: none;\n}\n';

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
      mountSettingsHelp(panel, "ultron-setting-tooltip");
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
        label: settingHelp("Hide ads", "Hide ad placements on supported game pages."),
        subSettings: [{
          key: "close_home",
          label: settingHelp("Homepage ads", "Dismiss eligible homepage ads and keep the koban collection option."),
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
        label: settingHelp("Shop and news popups", "Dismiss shop and news popups that open within the first two seconds.")
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
        label: settingHelp("Selected popups", "Dismiss selected popups on the homepage or season page."),
        subSettings: [{
          key: "homepage",
          label: settingHelp("Homepage", "Dismiss eligible shop, news, and special offer popups."),
          default: true
        }, {
          key: "season",
          label: settingHelp("Season", "Dismiss the season pass reminder."),
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
        label: settingHelp("Auto-confirm dialogs", "Close eligible battle and reward dialogs in the selected modes."),
        subSettings: [{
          key: "daddyrinthRelic",
          label: settingHelp("Labyrinth relics", "Confirm the relic reward dialog."),
          default: false
        }, {
          key: "leagueWin",
          label: settingHelp("League wins", "Close the league victory reward dialog."),
          default: false
          // }, {
          //     key: 'leagueLoss',
          //     label: `League loss confirmation`,
          //     default: false
        }, {
          key: "pantheonLoss",
          label: settingHelp("Pantheon losses", "Close the Pantheon loss dialog."),
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
        label: settingHelp("Spacebar shortcuts", "Use Space to confirm eligible rewards and dialogs in the selected modes."),
        subSettings: [{
          key: "daddyrinthRelic",
          label: settingHelp("Labyrinth flow", "Use Space on relics, heal dialogs, and eligible rewards."),
          default: false
        }, {
          key: "daddyrinthBattle",
          label: settingHelp("Labyrinth battles", "Use Space to perform and skip, or confirm when you win."),
          default: false
        }, {
          key: "leagueBattle",
          label: settingHelp("League battles", "Use Space on the league reward confirmation."),
          default: false
        }, {
          key: "activitiesReward",
          label: settingHelp("Activities rewards", "Use Space on the Activities reward dialog."),
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
          name: `<span tooltip="By Iron Man · v${"0.3.10 Dev"}">HH Ultron</span>`
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL2RvbS50cyIsICJzcmMvbW9kdWxlcy9hZHMvUmVtb3ZlQURzLnRzIiwgInNyYy9tb2R1bGVzL3BvcHVwcy9IaWRlUG9wdXBzLnRzIiwgInNyYy9tb2R1bGVzL3BvcHVwcy9DbG9zZVBvcHVwcy50cyIsICJzcmMvbW9kdWxlcy9iYXR0bGVzL0F1dG9Db25maXJtLnRzIiwgInNyYy9tb2R1bGVzL2tleWJvYXJkL1NwYWNlYmFySGVscC50cyIsICJzcmMvaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBsZXQgJDogSlF1ZXJ5U3RhdGljO1xuZXhwb3J0IGxldCBjdXJyZW50UGFnZTogc3RyaW5nO1xuZXhwb3J0IGNvbnN0IHJld2FyZEJ1dHRvbiA9ICdidXR0b24uYmx1ZV9idXR0b25fTFtjb25maXJtX2JsdWVfYnV0dG9uXSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0R2FtZShqUXVlcnk6IEpRdWVyeVN0YXRpYykge1xuICAgICQgPSBqUXVlcnk7XG4gICAgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIHNldHRpbmdIZWxwKGxhYmVsOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlc2NhcGUgPSAodGV4dDogc3RyaW5nKSA9PiB0ZXh0LnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKS5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JykucmVwbGFjZUFsbCgnPicsICcmZ3Q7Jyk7XG4gICAgcmV0dXJuIGVzY2FwZShsYWJlbCkgKyAnIDxzcGFuIGNsYXNzPVwiaXJvbm1hbi1zZXR0aW5nLWhlbHBcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYXJpYS1sYWJlbD1cIkFib3V0ICcgK1xuICAgICAgICBlc2NhcGUobGFiZWwpICsgJ1wiIGRhdGEtc2V0dGluZy1oZWxwPVwiJyArIGVzY2FwZShkZXNjcmlwdGlvbikgKyAnXCI+Pzwvc3Bhbj4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRTZXR0aW5nc0hlbHAocGFuZWw6IEhUTUxFbGVtZW50LCB0b29sdGlwSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sdGlwLmlkID0gdG9vbHRpcElkO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2lyb25tYW4tc2V0dGluZy10b29sdGlwJztcbiAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG4gICAgY29uc3QgcG9wb3ZlciA9IHR5cGVvZiB0b29sdGlwLnNob3dQb3BvdmVyID09PSAnZnVuY3Rpb24nO1xuICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKTtcbiAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gICAgbGV0IGFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBnZXRIZWxwID0gKHRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsKSA9PlxuICAgICAgICB0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1zZXR0aW5nLWhlbHBdJykgOiBudWxsO1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFuY2hvcikgcmV0dXJuO1xuICAgICAgICBhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIGFuY2hvciA9IG51bGw7XG4gICAgICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIH07XG4gICAgY29uc3Qgc2hvdyA9IChoZWxwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoYW5jaG9yID09PSBoZWxwKSByZXR1cm47XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGFuY2hvciA9IGhlbHA7XG4gICAgICAgIGhlbHAuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdG9vbHRpcElkKTtcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGhlbHAuZGF0YXNldC5zZXR0aW5nSGVscCA/PyAnJztcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGhlbHAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0V2lkdGgsIG9mZnNldEhlaWdodCB9ID0gdG9vbHRpcDtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oYm91bmRzLmxlZnQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFdpZHRoIC0gOCkpICsgJ3B4JztcbiAgICAgICAgY29uc3QgYmVsb3cgPSBib3VuZHMuYm90dG9tICsgNjtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAoYmVsb3cgKyBvZmZzZXRIZWlnaHQgPD0gd2luZG93LmlubmVySGVpZ2h0IC0gOFxuICAgICAgICAgICAgPyBiZWxvdyA6IE1hdGgubWF4KDgsIGJvdW5kcy50b3AgLSBvZmZzZXRIZWlnaHQgLSA2KSkgKyAncHgnO1xuICAgIH07XG5cbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3ZlcicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgZXZlbnQucG9pbnRlclR5cGUgIT09ICd0b3VjaCcpIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm91dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgPT09IGFuY2hvciAmJiBoZWxwICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGhlbHApIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHApIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChnZXRIZWxwKGV2ZW50LnRhcmdldCkgPT09IGFuY2hvcikgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKCFoZWxwKSByZXR1cm47XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93KGhlbHApO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGhlbHAgPSBnZXRIZWxwKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChoZWxwICYmIChldmVudC5rZXkgPT09ICdFbnRlcicgfHwgZXZlbnQua2V5ID09PSAnICcpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzaG93KGhlbHApO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2hvciAmJiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSAhPT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNsb3NlLCB7IHBhc3NpdmU6IHRydWUgfSk7XG59XG4iLCAiLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIlVsdHJvblwiXSAucGFuZWwtY29udGVudHMge1xuICAgIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xuICAgIGFsaWduLWl0ZW1zOiBzdGFydDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWw6aGFzKD4gLmdyb3VwLXBhbmVsW3JlbD1cIlVsdHJvblwiXS5zaG93bikge1xuICAgIG92ZXJmbG93OiBjbGlwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIlVsdHJvblwiXSAuY29uZmlnLXNldHRpbmcuaGFzLXN1YnNldHRpbmdzIHtcbiAgICBncmlkLXJvdy1lbmQ6IGF1dG87XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiVWx0cm9uXCJdIC51bHRyb24tcGFja2VkLXNldHRpbmdzIHtcbiAgICBncmlkLWF1dG8tZmxvdzogcm93IGRlbnNlO1xuICAgIGdyaWQtYXV0by1yb3dzOiAxcHg7XG4gICAgcm93LWdhcDogMDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJVbHRyb25cIl0gLnVsdHJvbi1wYWNrZWQtc2V0dGluZ3MgLmNvbmZpZy1zZXR0aW5nIHtcbiAgICBncmlkLXJvdy1lbmQ6IHNwYW4gdmFyKC0tdWx0cm9uLXNldHRpbmctcm93cywgMSk7XG59XG4uaXJvbm1hbi1zZXR0aW5nLWhlbHAge1xuICAgIGRpc3BsYXk6IGlubGluZS1ncmlkO1xuICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBpbmxpbmUtc2l6ZTogMS4yNWVtO1xuICAgIGJsb2NrLXNpemU6IDEuMjVlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgIGZvbnQtc2l6ZTogLjhlbTtcbiAgICBsaW5lLWhlaWdodDogMTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogLjA4ZW07XG4gICAgY3Vyc29yOiBoZWxwO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmhvdmVyLFxuLmlyb25tYW4tc2V0dGluZy1oZWxwOmZvY3VzLXZpc2libGUge1xuICAgIG91dGxpbmU6IDFweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gICAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbi5pcm9ubWFuLXNldHRpbmctdG9vbHRpcCB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIGluc2V0OiBhdXRvO1xuICAgIHotaW5kZXg6IDEwMDEwO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWF4LXdpZHRoOiBtaW4oMThyZW0sIGNhbGMoMTAwdncgLSAxNnB4KSk7XG4gICAgbWFyZ2luOiAwO1xuICAgIHBhZGRpbmc6IC41ZW0gLjdlbTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb25maWctc2V0dGluZy1ib3JkZXIsICNhOWEzYmMpO1xuICAgIGJvcmRlci1yYWRpdXM6IC40ZW07XG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29uZmlnLXNldHRpbmctYmFja2dyb3VuZCwgIzI0MWUzMCk7XG4gICAgY29sb3I6ICNmZmY7XG4gICAgZm9udDogMTRweC8xLjQgc3lzdGVtLXVpLCBzYW5zLXNlcmlmO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuIiwgImltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IG1vdW50U2V0dGluZ3NIZWxwIH0gZnJvbSAnLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IGNzcyBmcm9tICcuL3NldHRpbmdzLmNzcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RTdHlsZXMoKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlLmNsYXNzTmFtZSA9ICdoaC11bHRyb24tc3R5bGUnO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gY3NzO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFja1NldHRpbmdzKCkge1xuICAgIGlmIChjdXJyZW50UGFnZSAhPT0gJy9ob21lLmh0bWwnKSByZXR1cm47XG5cbiAgICBjb25zdCBzZWxlY3RvciA9ICcuaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiVWx0cm9uXCJdIC5wYW5lbC1jb250ZW50cyc7XG4gICAgd2luZG93LkhIUGx1c1BsdXMuSGVscGVycy5kb1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3RvciwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKCFwYW5lbCkgcmV0dXJuO1xuICAgICAgICBwYW5lbC5jbGFzc0xpc3QucmVtb3ZlKCdoaC1zY3JvbGwnKTtcbiAgICAgICAgbW91bnRTZXR0aW5nc0hlbHAocGFuZWwsICd1bHRyb24tc2V0dGluZy10b29sdGlwJyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5IHx8ICEoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkgfHwgIXBhbmVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY29uc3QgdW5pdCA9IGV2ZW50LmRlbHRhTW9kZSA9PT0gMSA/IDE2IDogZXZlbnQuZGVsdGFNb2RlID09PSAyID8gcGFuZWwuY2xpZW50SGVpZ2h0IDogMTtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gcGFuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IC8gcGFuZWwub2Zmc2V0SGVpZ2h0IHx8IDE7XG4gICAgICAgICAgICBwYW5lbC5zY3JvbGxUb3AgKz0gZXZlbnQuZGVsdGFZICogdW5pdCAvIHNjYWxlO1xuICAgICAgICB9LCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGFuZWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5jb25maWctc2V0dGluZycpO1xuICAgICAgICBjb25zdCBwYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYW5lbC5vZmZzZXRXaWR0aCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgICAgICAgICAgICBjYXJkLnN0eWxlLnNldFByb3BlcnR5KCctLXVsdHJvbi1zZXR0aW5nLXJvd3MnLCBTdHJpbmcoY2FyZC5vZmZzZXRIZWlnaHQgKyAxMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFuZWwuY2xhc3NMaXN0LmFkZCgndWx0cm9uLXBhY2tlZC1zZXR0aW5ncycpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBncm91cE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIocGFjayk7XG4gICAgICAgIGlmIChwYW5lbC5wYXJlbnRFbGVtZW50KSBncm91cE9ic2VydmVyLm9ic2VydmUocGFuZWwucGFyZW50RWxlbWVudCwgeyBhdHRyaWJ1dGVGaWx0ZXI6IFsnY2xhc3MnXSB9KTtcbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihwYWNrKTtcbiAgICAgICAgICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiBzaXplT2JzZXJ2ZXIub2JzZXJ2ZShjYXJkKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFjaygpO1xuICAgIH0pO1xufVxuIiwgImV4cG9ydCB0eXBlIE1vZHVsZVNldHRpbmdzID0gUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG5cbmludGVyZmFjZSBDb25maWdTY2hlbWEge1xuICAgIGJhc2VLZXk6IHN0cmluZztcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGRlZmF1bHQ6IGJvb2xlYW47XG4gICAgc3ViU2V0dGluZ3M/OiB7IGtleTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBkZWZhdWx0OiBib29sZWFuIH1bXTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhITW9kdWxlIHtcbiAgICByZWFkb25seSBncm91cCA9ICdVbHRyb24nO1xuICAgIHJlYWRvbmx5IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hO1xuICAgIGhhc1J1biA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoeyBjb25maWdTY2hlbWEgfTogeyBuYW1lOiBzdHJpbmc7IGNvbmZpZ1NjaGVtYTogQ29uZmlnU2NoZW1hIH0pIHtcbiAgICAgICAgdGhpcy5jb25maWdTY2hlbWEgPSBjb25maWdTY2hlbWE7XG4gICAgfVxuXG4gICAgYWJzdHJhY3Qgc2hvdWxkUnVuKCk6IGJvb2xlYW47XG4gICAgYWJzdHJhY3QgcnVuKHNldHRpbmdzOiBNb2R1bGVTZXR0aW5ncyk6IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuIiwgImludGVyZmFjZSBPYnNlcnZlck9wdGlvbnMge1xuICAgIG9uY2U/OiBib29sZWFuO1xuICAgIHRpbWVvdXQ/OiBudW1iZXIgfCBudWxsO1xufVxuXG50eXBlIENsaWNrRGVsYXkgPSBudW1iZXIgfCBbbnVtYmVyLCBudW1iZXJdO1xuaW50ZXJmYWNlIENsaWNrT3B0aW9ucyBleHRlbmRzIE9ic2VydmVyT3B0aW9ucyB7XG4gICAgZGVsYXk/OiBDbGlja0RlbGF5O1xufVxuXG5pbnRlcmZhY2UgUG9wdXBPcHRpb25zIGV4dGVuZHMgQ2xpY2tPcHRpb25zIHtcbiAgICB0cmlnZ2VyU2VsZWN0b3I/OiBzdHJpbmc7XG4gICAgdGFyZ2V0U2VsZWN0b3I/OiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIG9ic2VydmVVbnRpbChzZWxlY3Rvcjogc3RyaW5nLCBjYWxsYmFjazogKGVsZW1lbnRzOiBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PikgPT4gdm9pZCxcbiAgICB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9OiBPYnNlcnZlck9wdGlvbnMgPSB7fSkge1xuICAgIGxldCB0aW1lcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBjYWxsYmFjayhlbGVtZW50cyk7XG4gICAgICAgIGlmIChvbmNlKSByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBpZiAodGltZXIpIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50cyk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG5cbiAgICAvLyBQYXNzIGB0aW1lb3V0OiBudWxsYCAob3IgYW55IG5vbi1maW5pdGUgdmFsdWUpIHRvIGRpc2FibGUgdGhlIHRpbWVvdXRcbiAgICBpZiAodGltZW91dCAhPT0gbnVsbCAmJiBOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIHtcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9OiBPYnNlcnZlck9wdGlvbnMgPSB7fSkge1xuICAgIG9ic2VydmVVbnRpbChzZWxlY3RvciwgKGVsZW1lbnRzKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfSk7XG4gICAgfSwgeyB0aW1lb3V0LCBvbmNlIH0pO1xufVxuXG5mdW5jdGlvbiBpc1Zpc2libGU8VCBleHRlbmRzIEVsZW1lbnQ+KGVsOiBUIHwgbnVsbCk6IGVsIGlzIFQge1xuICAgIHJldHVybiAhIShlbD8uaXNDb25uZWN0ZWQgJiYgZWwuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGggJiZcbiAgICAgICAgIWVsLmNsb3Nlc3QoJ1toaWRkZW5dLCBbaW5lcnRdLCBbYXJpYS1oaWRkZW49XCJ0cnVlXCJdJykgJiYgZ2V0Q29tcHV0ZWRTdHlsZShlbCkudmlzaWJpbGl0eSA9PT0gJ3Zpc2libGUnKTtcbn1cblxuZnVuY3Rpb24gaXNDbGlja2FibGU8VCBleHRlbmRzIEVsZW1lbnQ+KGVsOiBUIHwgbnVsbCk6IGVsIGlzIFQge1xuICAgIHJldHVybiBpc1Zpc2libGUoZWwpICYmICFlbC5tYXRjaGVzKCc6ZGlzYWJsZWQsIC5kaXNhYmxlZCwgW2FyaWEtZGlzYWJsZWQ9XCJ0cnVlXCJdJyk7XG59XG5cbmZ1bmN0aW9uIGdldENsaWNrRGVsYXkoZGVsYXk6IENsaWNrRGVsYXkpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShkZWxheSlcbiAgICAgICAgPyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoZGVsYXlbMV0gLSBkZWxheVswXSArIDEpKSArIGRlbGF5WzBdXG4gICAgICAgIDogZGVsYXk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcsXG4gICAgeyB0cmlnZ2VyU2VsZWN0b3IsIHRhcmdldFNlbGVjdG9yID0gJy5jbG9zYWJsZScsIG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCwgZGVsYXkgPSAwIH06IFBvcHVwT3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGNvbnRhaW5lcjogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGxldCBhY3RpdmVQb3B1cDogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGxldCBjbGlja2VkID0gZmFsc2U7XG4gICAgbGV0IHBlbmRpbmc6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIGxldCBleHBpcnk6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IGdldEFjdGl2ZVBvcHVwID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICBpZiAoIWlzVmlzaWJsZShwb3B1cCkpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAodHJpZ2dlclNlbGVjdG9yICYmICFBcnJheS5mcm9tKHBvcHVwLnF1ZXJ5U2VsZWN0b3JBbGwodHJpZ2dlclNlbGVjdG9yKSkuc29tZShlbGVtZW50ID0+IGlzVmlzaWJsZShlbGVtZW50KSkpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gcG9wdXA7XG4gICAgfTtcblxuICAgIGNvbnN0IGdldFRhcmdldCA9IChwb3B1cDogRWxlbWVudCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXRzID0gQXJyYXkuZnJvbShwb3B1cC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50Pih0YXJnZXRTZWxlY3RvcikpLmZpbHRlcihlbGVtZW50ID0+IGlzQ2xpY2thYmxlKGVsZW1lbnQpKTtcbiAgICAgICAgcmV0dXJuIHRhcmdldHMubGVuZ3RoID09PSAxID8gdGFyZ2V0c1swXSA6IG51bGw7XG4gICAgfTtcblxuICAgIGNvbnN0IGNoZWNrID0gKCkgPT4ge1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgY29uc3QgcG9wdXAgPSBnZXRBY3RpdmVQb3B1cCgpO1xuICAgICAgICBpZiAocG9wdXAgIT09IGFjdGl2ZVBvcHVwKSB7XG4gICAgICAgICAgICBpZiAocGVuZGluZyAhPT0gbnVsbCkgY2xlYXJUaW1lb3V0KHBlbmRpbmcpO1xuICAgICAgICAgICAgcGVuZGluZyA9IG51bGw7XG4gICAgICAgICAgICBjbGlja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBhY3RpdmVQb3B1cCA9IHBvcHVwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcG9wdXAgfHwgY2xpY2tlZCB8fCBwZW5kaW5nICE9PSBudWxsIHx8ICFnZXRUYXJnZXQocG9wdXApKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBwZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChnZXRBY3RpdmVQb3B1cCgpICE9PSBwb3B1cCkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZ2V0VGFyZ2V0KHBvcHVwKTtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0KSByZXR1cm47XG5cbiAgICAgICAgICAgIGNsaWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGV4cGlyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXJnZXQuY2xpY2soKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBjb21wdXRlZERlbGF5ID0gZ2V0Q2xpY2tEZWxheShkZWxheSk7XG4gICAgICAgIGlmIChjb21wdXRlZERlbGF5ID4gMCkgcGVuZGluZyA9IHNldFRpbWVvdXQoY2xpY2ssIGNvbXB1dGVkRGVsYXkpO1xuICAgICAgICBlbHNlIGNsaWNrKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgIGlmIChjdXJyZW50ICE9PSBjb250YWluZXIgfHwgKGN1cnJlbnQgJiYgbXV0YXRpb25zLnNvbWUoKHsgdGFyZ2V0IH0pID0+IGN1cnJlbnQuY29udGFpbnModGFyZ2V0KSB8fCB0YXJnZXQuY29udGFpbnMoY3VycmVudCkpKSkgY2hlY2soKTtcbiAgICB9KTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcycsICdzdHlsZScsICdoaWRkZW4nLCAnaW5lcnQnLCAnYXJpYS1oaWRkZW4nLCAnZGlzYWJsZWQnLCAnYXJpYS1kaXNhYmxlZCddXG4gICAgfSk7XG4gICAgaWYgKHRpbWVvdXQgIT09IG51bGwgJiYgTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpICYmIHRpbWVvdXQgPiAwKSBleHBpcnkgPSBzZXRUaW1lb3V0KCgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKSwgdGltZW91dCk7XG4gICAgY2hlY2soKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yOiBzdHJpbmcsIGNsYXNzVG9SZW1vdmU6IHN0cmluZyxcbiAgICB7IG9uY2UgPSB0cnVlLCB0aW1lb3V0ID0gNTAwMCB9OiBPYnNlcnZlck9wdGlvbnMgPSB7fSkge1xuICAgIG9ic2VydmVVbnRpbChzZWxlY3RvciwgKGVsZW1lbnRzKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShjbGFzc1RvUmVtb3ZlKSk7XG4gICAgfSwgeyB0aW1lb3V0LCBvbmNlIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xpY2tXaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3I6IHN0cmluZywgZWxlbWVudFRvQ2xpY2s6IHN0cmluZyxcbiAgICB7IGRlbGF5ID0gMjAwMCwgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH06IENsaWNrT3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHBlbmRpbmcgPSBmYWxzZTtcbiAgICBsZXQgaGFzQ2xpY2tlZCA9IGZhbHNlO1xuXG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgIGlmIChoYXNDbGlja2VkIHx8IHBlbmRpbmcpIHJldHVybjtcblxuICAgICAgICBjb25zdCBjbG9zZUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihlbGVtZW50VG9DbGljayk7XG4gICAgICAgIGlmIChpc0NsaWNrYWJsZShjbG9zZUVsZW1lbnQpKSB7XG4gICAgICAgICAgICBwZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ2xpY2thYmxlKGNsb3NlRWxlbWVudCkgJiYgQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkuc29tZShlbGVtZW50ID0+IGlzVmlzaWJsZShlbGVtZW50KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzQ2xpY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlRWxlbWVudC5jbGljaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGdldENsaWNrRGVsYXkoZGVsYXkpKTtcbiAgICAgICAgfVxuICAgIH0sIHsgdGltZW91dCwgb25jZSB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwYWNlYmFyVG9DbGljayhzZWxlY3RvcnM6IHsgc2VsZWN0b3I6IHN0cmluZzsgdHJpZ2dlclNlbGVjdG9yPzogc3RyaW5nIH1bXSkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgICBpZiAoZS5rZXkgIT09ICcgJyAmJiBlLmNvZGUgIT09ICdTcGFjZScpIHJldHVybjtcbiAgICAgICAgaWYgKGUuZGVmYXVsdFByZXZlbnRlZCB8fCBlLnJlcGVhdCB8fCBlLmlzQ29tcG9zaW5nIHx8IGUuYWx0S2V5IHx8IGUuY3RybEtleSB8fCBlLm1ldGFLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgICAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmXG4gICAgICAgICAgICBlLnRhcmdldC5jbG9zZXN0KCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgYnV0dG9uLCBhW2hyZWZdLCBbcm9sZT1cImJ1dHRvblwiXSwgW2NvbnRlbnRlZGl0YWJsZV06bm90KFtjb250ZW50ZWRpdGFibGU9XCJmYWxzZVwiXSknKSkgcmV0dXJuO1xuXG4gICAgICAgIGZvciAoY29uc3QgeyBzZWxlY3RvciwgdHJpZ2dlclNlbGVjdG9yIH0gb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBpZiAodHJpZ2dlclNlbGVjdG9yICYmICFBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodHJpZ2dlclNlbGVjdG9yKSkuc29tZShlbGVtZW50ID0+IGlzVmlzaWJsZShlbGVtZW50KSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpLmZpbHRlcihlbGVtZW50ID0+IGlzQ2xpY2thYmxlKGVsZW1lbnQpKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXRzLmxlbmd0aCAhPT0gMSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IFtlbF0gPSB0YXJnZXRzO1xuICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgcG9zWCA9IHJlY3QubGVmdCArIHJlY3Qud2lkdGggLyAyO1xuICAgICAgICAgICAgY29uc3QgcG9zWSA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyO1xuICAgICAgICAgICAgaWYgKCFlbC5jb250YWlucyhkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHBvc1gsIHBvc1kpKSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2xpZW50WDogcG9zWCwgY2xpZW50WTogcG9zWSxcbiAgICAgICAgICAgICAgICBzY3JlZW5YOiBwb3NYLCBzY3JlZW5ZOiBwb3NZfSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUsIHJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlLCBjbGlja1doZW5TZWxlY3RvckF2YWlsYWJsZSB9IGZyb20gJy4uLy4uL2RvbSc7XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVBRHMgZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAncmVtb3ZlQURzJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJIaWRlIGFkc1wiLCBcIkhpZGUgYWQgcGxhY2VtZW50cyBvbiBzdXBwb3J0ZWQgZ2FtZSBwYWdlcy5cIiksXG4gICAgICAgICAgICBzdWJTZXR0aW5nczogW3tcbiAgICAgICAgICAgICAgICBrZXk6ICdjbG9zZV9ob21lJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJIb21lcGFnZSBhZHNcIiwgXCJEaXNtaXNzIGVsaWdpYmxlIGhvbWVwYWdlIGFkcyBhbmQga2VlcCB0aGUga29iYW4gY29sbGVjdGlvbiBvcHRpb24uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2FjdGl2aXRpZXMuaHRtbCcpIHx8XG4gICAgICAgICgvXFwvcXVlc3RcXC9cXGQrJC8udGVzdChjdXJyZW50UGFnZSkpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYm9zcy1iYW5nLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9jaGFtcGlvbnMtbWFwLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2dvZC1wYXRoLmh0bWwnKSB8fFxuICAgICAgICAoL1xcL2NoYXJhY3RlcnNcXC9cXGQrJC8udGVzdChjdXJyZW50UGFnZSkpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvaG9tZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGguaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGgtcHJlLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWUtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGFudGhlb24tYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3NlYXNvbi5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9zZWFzb24tYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3Nob3AuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvdHJvbGwtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3dvcmxkLWJvc3MtYmF0dGxlLmh0bWwnKVxuICAgIH1cblxuICAgIHJ1bih7IGNsb3NlX2hvbWUgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2FjdGl2aXRpZXMuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuYWQtcmV2aXZlLWNvbnRhaW5lcicsIHsgb25jZTogZmFsc2UgfSk7XG4gICAgICAgICAgICByZW1vdmVDbGFzc1doZW5TZWxlY3RvckF2YWlsYWJsZSgnLmhlaWdodC1mb3ItYWQnLCAnaGVpZ2h0LWZvci1hZCcsIHsgb25jZTogZmFsc2UgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoL1xcL3F1ZXN0XFwvXFxkKyQvLnRlc3QoY3VycmVudFBhZ2UpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfcXVlc3QnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2Jvc3MtYmFuZy1iYXR0bGUuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfYmF0dGxlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9jaGFtcGlvbnMtbWFwLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2NoYW1waW9uc19tYXAnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2dvZC1wYXRoLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2dvZC1wYXRoJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoL1xcL2NoYXJhY3RlcnNcXC9cXGQrJC8udGVzdChjdXJyZW50UGFnZSkpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9oYXJlbScpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvaG9tZS5odG1sJykpIHtcbiAgICAgICAgICAgIGlmIChjbG9zZV9ob21lKSBjbGlja1doZW5TZWxlY3RvckF2YWlsYWJsZSgnLmJlY29tZS1tZW1iZXItdGV4dCcsICdjbG9zZScsIHsgZGVsYXk6IFs1MDAsIDE1MDBdLCBvbmNlOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9sYWJ5cmludGgnLCB7IG9uY2U6IGZhbHNlLCB0aW1lb3V0OiBudWxsIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLWJhdHRsZS5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9iYXR0bGUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC1wcmUtYmF0dGxlLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2xhYnlyaW50aC1wcmUtYmF0dGxlJywgeyBvbmNlOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZS1iYXR0bGUuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfYmF0dGxlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sb3ZlLXJhaWRzLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2xvdmVfcmFpZHMnKTtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuaGVpZ2h0LWZvci1hZCcsICdoZWlnaHQtZm9yLWFkJywgeyBvbmNlOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhbnRoZW9uLWJhdHRsZS5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9iYXR0bGUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3NlYXNvbi5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9zZWFzb24nKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3NlYXNvbi1iYXR0bGUuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfYmF0dGxlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9zaG9wLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX3Nob3AnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3Ryb2xsLWJhdHRsZS5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9iYXR0bGUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3dvcmxkLWJvc3MtYmF0dGxlLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2JhdHRsZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UgfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIgfSBmcm9tICcuLi8uLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgSGlkZVBvcHVwcyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdoaWRlUG9wdXBzJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJTaG9wIGFuZCBuZXdzIHBvcHVwc1wiLCBcIkRpc21pc3Mgc2hvcCBhbmQgbmV3cyBwb3B1cHMgdGhhdCBvcGVuIHdpdGhpbiB0aGUgZmlyc3QgdHdvIHNlY29uZHMuXCIpLFxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2hvbWUuaHRtbCcpXG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI25vX0hDJywgeyB0aW1lb3V0OiAyMDAwIH0pO1xuICAgICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjbmV3c19kZXRhaWxzX3BvcHVwJywgeyB0YXJnZXRTZWxlY3RvcjogJy5iYWNrX2J1dHRvbicsIHRpbWVvdXQ6IDIwMDAgfSk7XG4gICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNwb3B1cF9uZXdzJywgeyB0aW1lb3V0OiAyMDAwIH0pO1xuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lciB9IGZyb20gJy4uLy4uL2RvbSc7XG5cbmV4cG9ydCBjbGFzcyBDbG9zZVBvcHVwcyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdjbG9zZVBvcHVwcydcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiU2VsZWN0ZWQgcG9wdXBzXCIsIFwiRGlzbWlzcyBzZWxlY3RlZCBwb3B1cHMgb24gdGhlIGhvbWVwYWdlIG9yIHNlYXNvbiBwYWdlLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2hvbWVwYWdlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJIb21lcGFnZVwiLCBcIkRpc21pc3MgZWxpZ2libGUgc2hvcCwgbmV3cywgYW5kIHNwZWNpYWwgb2ZmZXIgcG9wdXBzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnc2Vhc29uJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJTZWFzb25cIiwgXCJEaXNtaXNzIHRoZSBzZWFzb24gcGFzcyByZW1pbmRlci5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvaG9tZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9zZWFzb24uaHRtbCcpXG4gICAgfVxuXG4gICAgcnVuKHsgaG9tZXBhZ2UsIHNlYXNvbiB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvaG9tZS5odG1sJykgJiYgaG9tZXBhZ2UpIHtcbiAgICAgICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNub19IQycsIHsgdGltZW91dDogMjAwMCwgZGVsYXk6IFsyNTAsMzAwXSB9KTtcbiAgICAgICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNuZXdzX2RldGFpbHNfcG9wdXAnLCB7IHRhcmdldFNlbGVjdG9yOiAnLmJhY2tfYnV0dG9uJywgdGltZW91dDogMjAwMCwgZGVsYXk6IFsyNTAsMzAwXSB9KTtcbiAgICAgICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNwb3B1cF9uZXdzJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3RyaWFsX21vbnRobHlfY2FyZF9wb3B1cCcsIHsgdGltZW91dDogMjAwMCwgZGVsYXk6IFsyNTAsMzAwXSB9KTtcbiAgICAgICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyN1bmlxdWVfZGVhbF9wb3B1cCcsIHsgdGltZW91dDogMjAwMCwgZGVsYXk6IFsyNTAsMzAwXSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3NlYXNvbi5odG1sJykgJiYgc2Vhc29uKSB7XG4gICAgICAgICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjcGFzc19yZW1pbmRlcl9wb3B1cCcsIHsgdGltZW91dDogMjAwMCwgZGVsYXk6IFsyNTAsMzAwXSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSwgcmV3YXJkQnV0dG9uIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyIH0gZnJvbSAnLi4vLi4vZG9tJztcblxuZXhwb3J0IGNsYXNzIEF1dG9Db25maXJtIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2F1dG9Db25maXJtJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJBdXRvLWNvbmZpcm0gZGlhbG9nc1wiLCBcIkNsb3NlIGVsaWdpYmxlIGJhdHRsZSBhbmQgcmV3YXJkIGRpYWxvZ3MgaW4gdGhlIHNlbGVjdGVkIG1vZGVzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2RhZGR5cmludGhSZWxpYycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTGFieXJpbnRoIHJlbGljc1wiLCBcIkNvbmZpcm0gdGhlIHJlbGljIHJld2FyZCBkaWFsb2cuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnbGVhZ3VlV2luJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMZWFndWUgd2luc1wiLCBcIkNsb3NlIHRoZSBsZWFndWUgdmljdG9yeSByZXdhcmQgZGlhbG9nLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgLy8gfSwge1xuICAgICAgICAgICAgLy8gICAgIGtleTogJ2xlYWd1ZUxvc3MnLFxuICAgICAgICAgICAgLy8gICAgIGxhYmVsOiBgTGVhZ3VlIGxvc3MgY29uZmlybWF0aW9uYCxcbiAgICAgICAgICAgIC8vICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ3BhbnRoZW9uTG9zcycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiUGFudGhlb24gbG9zc2VzXCIsIFwiQ2xvc2UgdGhlIFBhbnRoZW9uIGxvc3MgZGlhbG9nLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGguaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWUtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3BhbnRoZW9uLWJhdHRsZS5odG1sJylcbiAgICB9XG5cbiAgICBydW4oeyBkYWRkeXJpbnRoUmVsaWMsIGxlYWd1ZVdpbiwgcGFudGhlb25Mb3NzIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGguaHRtbCcpICYmIGRhZGR5cmludGhSZWxpYykge1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI2xhYnlyaW50aF9yZXdhcmRfcG9wdXAnLCB7IHRhcmdldFNlbGVjdG9yOiAnI2Nsb3NlLXJlbGljLXBvcHVwJywgdGltZW91dDogbnVsbCwgZGVsYXk6IFs1MCwxNTBdIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3VlLWJhdHRsZS5odG1sJykpICYmIGxlYWd1ZVdpbikge1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3Jld2FyZHNfcG9wdXAnLCB7IHRyaWdnZXJTZWxlY3RvcjogJyNyZXdhcmRfaG9sZGVyJywgdGFyZ2V0U2VsZWN0b3I6IHJld2FyZEJ1dHRvbiwgb25jZTogZmFsc2UsIHRpbWVvdXQ6IG51bGwsIGRlbGF5OiBbNTAsMTUwXSB9KTtcbiAgICAgICAgLy8gfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3VlLWJhdHRsZS5odG1sJykgJiYgbGVhZ3VlTG9zcykge1xuICAgICAgICAvLyAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3Jld2FyZHNfcG9wdXAnLCB7IHRyaWdnZXJTZWxlY3RvcjogJyN1cGdyYWRlX2NoYXJhY3RlcnMnLCB0YXJnZXRTZWxlY3RvcjogcmV3YXJkQnV0dG9uLCBvbmNlOiBmYWxzZSwgdGltZW91dDogbnVsbCwgZGVsYXk6IFs1MCwxNTBdIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGFudGhlb24tYmF0dGxlLmh0bWwnKSAmJiBwYW50aGVvbkxvc3MpIHtcbiAgICAgICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNyZXdhcmRzX3BvcHVwJywgeyB0cmlnZ2VyU2VsZWN0b3I6ICcubG9zdC1maXJzdC1yb3cnLCB0YXJnZXRTZWxlY3RvcjogcmV3YXJkQnV0dG9uLCB0aW1lb3V0OiBudWxsLCBkZWxheTogWzUwLDE1MF0gfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgdHlwZSB7IE1vZHVsZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHsgY3VycmVudFBhZ2UsIHJld2FyZEJ1dHRvbiB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgc3BhY2ViYXJUb0NsaWNrIH0gZnJvbSAnLi4vLi4vZG9tJztcblxuZXhwb3J0IGNsYXNzIFNwYWNlYmFySGVscCBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdzcGFjZWJhckhlbHAnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlNwYWNlYmFyIHNob3J0Y3V0c1wiLCBcIlVzZSBTcGFjZSB0byBjb25maXJtIGVsaWdpYmxlIHJld2FyZHMgYW5kIGRpYWxvZ3MgaW4gdGhlIHNlbGVjdGVkIG1vZGVzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2RhZGR5cmludGhSZWxpYycsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTGFieXJpbnRoIGZsb3dcIiwgXCJVc2UgU3BhY2Ugb24gcmVsaWNzLCBoZWFsIGRpYWxvZ3MsIGFuZCBlbGlnaWJsZSByZXdhcmRzLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2RhZGR5cmludGhCYXR0bGUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxhYnlyaW50aCBiYXR0bGVzXCIsIFwiVXNlIFNwYWNlIHRvIHBlcmZvcm0gYW5kIHNraXAsIG9yIGNvbmZpcm0gd2hlbiB5b3Ugd2luLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2xlYWd1ZUJhdHRsZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTGVhZ3VlIGJhdHRsZXNcIiwgXCJVc2UgU3BhY2Ugb24gdGhlIGxlYWd1ZSByZXdhcmQgY29uZmlybWF0aW9uLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogJ2FjdGl2aXRpZXNSZXdhcmQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkFjdGl2aXRpZXMgcmV3YXJkc1wiLCBcIlVzZSBTcGFjZSBvbiB0aGUgQWN0aXZpdGllcyByZXdhcmQgZGlhbG9nLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGguaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLXByZS1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWVzLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZS1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYWN0aXZpdGllcy5odG1sJylcbiAgICB9XG5cbiAgICBydW4oeyBkYWRkeXJpbnRoUmVsaWMsIGRhZGR5cmludGhCYXR0bGUsIGxlYWd1ZUJhdHRsZSwgYWN0aXZpdGllc1Jld2FyZCB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLmh0bWwnKSAmJiBkYWRkeXJpbnRoUmVsaWMpIHtcbiAgICAgICAgICAgIHNwYWNlYmFyVG9DbGljayhbXG4gICAgICAgICAgICAgICAgeyBzZWxlY3RvcjogJyNsYWJ5cmludGhfcmV3YXJkX3BvcHVwICNjbG9zZS1yZWxpYy1wb3B1cCcgfSxcbiAgICAgICAgICAgICAgICB7IHNlbGVjdG9yOiBgI3Jld2FyZHNfcG9wdXAgJHtyZXdhcmRCdXR0b259YCB9LFxuICAgICAgICAgICAgICAgIHsgc2VsZWN0b3I6ICcjaGVhbF9naXJsX2xhYnlyaW50aF9wb3B1cCBidXR0b24uYmx1ZV9idXR0b25fTCcgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0gZWxzZSBpZiAoKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLXByZS1iYXR0bGUuaHRtbCcpIHx8IGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLWJhdHRsZS5odG1sJykpICYmIGRhZGR5cmludGhCYXR0bGUpIHtcbiAgICAgICAgICAgIHNwYWNlYmFyVG9DbGljayhbXG4gICAgICAgICAgICAgICAgeyBzZWxlY3RvcjogYCNyZXdhcmRzX3BvcHVwICR7cmV3YXJkQnV0dG9ufWAsIHRyaWdnZXJTZWxlY3RvcjogJyNyZXdhcmRzX3BvcHVwICNyZXdhcmRfaG9sZGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc2VsZWN0b3I6ICcjcHJlLWJhdHRsZSAuYmx1ZV9idXR0b25fTDpudGgtb2YtdHlwZSgyKScgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0gZWxzZSBpZiAoKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJykgfHwgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWUtYmF0dGxlLmh0bWwnKSkgJiYgbGVhZ3VlQmF0dGxlKSB7XG4gICAgICAgICAgICBzcGFjZWJhclRvQ2xpY2soW3sgc2VsZWN0b3I6IGAjcmV3YXJkc19wb3B1cCAke3Jld2FyZEJ1dHRvbn1gIH1dKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2FjdGl2aXRpZXMuaHRtbCcpICYmIGFjdGl2aXRpZXNSZXdhcmQpIHtcbiAgICAgICAgICAgIHNwYWNlYmFyVG9DbGljayhbeyBzZWxlY3RvcjogYCNyZXdhcmRzX3BvcHVwICR7cmV3YXJkQnV0dG9ufWAgfV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IGluaXRHYW1lIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IGluamVjdFN0eWxlcywgcGFja1NldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBSZW1vdmVBRHMgfSBmcm9tICcuL21vZHVsZXMvYWRzL1JlbW92ZUFEcyc7XG5pbXBvcnQgeyBIaWRlUG9wdXBzIH0gZnJvbSAnLi9tb2R1bGVzL3BvcHVwcy9IaWRlUG9wdXBzJztcbmltcG9ydCB7IENsb3NlUG9wdXBzIH0gZnJvbSAnLi9tb2R1bGVzL3BvcHVwcy9DbG9zZVBvcHVwcyc7XG5pbXBvcnQgeyBBdXRvQ29uZmlybSB9IGZyb20gJy4vbW9kdWxlcy9iYXR0bGVzL0F1dG9Db25maXJtJztcbmltcG9ydCB7IFNwYWNlYmFySGVscCB9IGZyb20gJy4vbW9kdWxlcy9rZXlib2FyZC9TcGFjZWJhckhlbHAnO1xuXG5mdW5jdGlvbiBydW5VbHRyb24oKSB7XG4gICAgY29uc3QgeyAkIH0gPSB3aW5kb3c7XG5cbiAgICBpZiAoISQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1dBUk5JTkc6IE5vIGpRdWVyeSBmb3VuZC4gUHJvYmFibHkgYW4gZXJyb3IgcGFnZS4gRW5kaW5nIHRoZSBzY3JpcHQgaGVyZScpXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGluaXRHYW1lKCQpO1xuICAgIGluamVjdFN0eWxlcygpO1xuXG4gICAgY29uc3QgYWxsTW9kdWxlcyA9IFtcbiAgICAgICAgbmV3IFJlbW92ZUFEcygpLFxuICAgICAgICBuZXcgSGlkZVBvcHVwcygpLFxuICAgICAgICBuZXcgQ2xvc2VQb3B1cHMoKSxcbiAgICAgICAgbmV3IEF1dG9Db25maXJtKCksXG4gICAgICAgIG5ldyBTcGFjZWJhckhlbHAoKVxuICAgIF1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBydW5TY3JpcHQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhoUGx1c1BsdXNDb25maWcgfSA9IHdpbmRvd1xuICAgICAgICAgICAgaWYgKCFoaFBsdXNQbHVzQ29uZmlnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJHcm91cCh7XG4gICAgICAgICAgICAgICAga2V5OiAnVWx0cm9uJyxcbiAgICAgICAgICAgICAgICBuYW1lOiBgPHNwYW4gdG9vbHRpcD1cIkJ5IElyb24gTWFuIMK3IHYke1VTRVJTQ1JJUFRfVkVSU0lPTl9MQUJFTH1cIj5ISCBVbHRyb248L3NwYW4+YFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGFsbE1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucmVnaXN0ZXJNb2R1bGUobW9kdWxlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcubG9hZENvbmZpZygpXG4gICAgICAgICAgICBoaFBsdXNQbHVzQ29uZmlnLnJ1bk1vZHVsZXMoKVxuICAgICAgICAgICAgcGFja1NldHRpbmdzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93LmhoUGx1c1BsdXNDb25maWcpIHtcbiAgICAgICAgICAgIHJ1blNjcmlwdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbmUoJ2hoKystYmRzbTpsb2FkZWQnLCBydW5TY3JpcHQpXG4gICAgICAgIH1cbiAg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
