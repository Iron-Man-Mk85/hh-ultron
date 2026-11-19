// ==UserScript==
// @name           HH Ultron (Dev)
// @version        0.3.11
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
  var settings_default = '.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .panel-contents {\n    align-content: start;\n    align-items: start;\n    overflow-y: auto;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n}\n.hh-plus-plus-config-panel:has(> .group-panel[rel="Ultron"].shown) {\n    overflow: clip;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .config-setting.has-subsettings {\n    grid-row-end: auto;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .ultron-packed-settings {\n    grid-auto-flow: row dense;\n    grid-auto-rows: 1px;\n    row-gap: 0;\n}\n.hh-plus-plus-config-panel .group-panel[rel="Ultron"] .ultron-packed-settings .config-setting {\n    grid-row-end: span var(--ultron-setting-rows, 1);\n}\n.hh-plus-plus-config-panel .tabs h4[rel="Ultron"] {\n    position: relative;\n}\n.hh-plus-plus-config-panel .tabs h4[rel="Ultron"].selected::after {\n    content: var(--ultron-version);\n    position: absolute;\n    inset-block-start: 0;\n    inset-inline-end: .15rem;\n    font-size: .625rem;\n    font-weight: normal;\n    line-height: 1;\n    text-transform: none;\n    pointer-events: none;\n}\n.ironman-setting-help {\n    display: inline-grid;\n    place-items: center;\n    box-sizing: border-box;\n    inline-size: 1.25em;\n    block-size: 1.25em;\n    border: 1px solid currentColor;\n    border-radius: 50%;\n    font-size: .8em;\n    line-height: 1;\n    vertical-align: .08em;\n    cursor: help;\n}\n.ironman-setting-help:hover,\n.ironman-setting-help:focus-visible {\n    outline: 1px solid currentColor;\n    outline-offset: 2px;\n}\n.ironman-setting-tooltip {\n    position: fixed;\n    inset: auto;\n    z-index: 10010;\n    box-sizing: border-box;\n    max-width: min(18rem, calc(100vw - 16px));\n    margin: 0;\n    padding: .5em .7em;\n    border: 1px solid var(--config-setting-border, #a9a3bc);\n    border-radius: .4em;\n    background: var(--config-setting-background, #241e30);\n    color: #fff;\n    font: 14px/1.4 system-ui, sans-serif;\n    pointer-events: none;\n}\n';

  // src/settings.ts
  function injectStyles() {
    const style = document.createElement("style");
    style.className = "hh-ultron-style";
    style.textContent = `${settings_default}
        .hh-plus-plus-config-panel { --ultron-version: "v${"0.3.11"}"; }
    `;
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
          name: "HH Ultron"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2dhbWUudHMiLCAic3JjL3NldHRpbmdzSGVscC50cyIsICJzcmMvc2V0dGluZ3MuY3NzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvSEhNb2R1bGUudHMiLCAic3JjL2RvbS50cyIsICJzcmMvbW9kdWxlcy9hZHMvUmVtb3ZlQURzLnRzIiwgInNyYy9tb2R1bGVzL3BvcHVwcy9IaWRlUG9wdXBzLnRzIiwgInNyYy9tb2R1bGVzL3BvcHVwcy9DbG9zZVBvcHVwcy50cyIsICJzcmMvbW9kdWxlcy9iYXR0bGVzL0F1dG9Db25maXJtLnRzIiwgInNyYy9tb2R1bGVzL2tleWJvYXJkL1NwYWNlYmFySGVscC50cyIsICJzcmMvaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBsZXQgJDogSlF1ZXJ5U3RhdGljO1xuZXhwb3J0IGxldCBjdXJyZW50UGFnZTogc3RyaW5nO1xuZXhwb3J0IGNvbnN0IHJld2FyZEJ1dHRvbiA9ICdidXR0b24uYmx1ZV9idXR0b25fTFtjb25maXJtX2JsdWVfYnV0dG9uXSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0R2FtZShqUXVlcnk6IEpRdWVyeVN0YXRpYykge1xuICAgICQgPSBqUXVlcnk7XG4gICAgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIHNldHRpbmdIZWxwKGxhYmVsOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgICBjb25zdCBlc2NhcGUgPSAodGV4dDogc3RyaW5nKSA9PiB0ZXh0LnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKS5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JykucmVwbGFjZUFsbCgnPicsICcmZ3Q7Jyk7XG4gICAgcmV0dXJuIGVzY2FwZShsYWJlbCkgKyAnIDxzcGFuIGNsYXNzPVwiaXJvbm1hbi1zZXR0aW5nLWhlbHBcIiByb2xlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgYXJpYS1sYWJlbD1cIkFib3V0ICcgK1xuICAgICAgICBlc2NhcGUobGFiZWwpICsgJ1wiIGRhdGEtc2V0dGluZy1oZWxwPVwiJyArIGVzY2FwZShkZXNjcmlwdGlvbikgKyAnXCI+Pzwvc3Bhbj4nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW91bnRTZXR0aW5nc0hlbHAocGFuZWw6IEhUTUxFbGVtZW50LCB0b29sdGlwSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0b29sdGlwLmlkID0gdG9vbHRpcElkO1xuICAgIHRvb2x0aXAuY2xhc3NOYW1lID0gJ2lyb25tYW4tc2V0dGluZy10b29sdGlwJztcbiAgICB0b29sdGlwLnNldEF0dHJpYnV0ZSgncm9sZScsICd0b29sdGlwJyk7XG4gICAgY29uc3QgcG9wb3ZlciA9IHR5cGVvZiB0b29sdGlwLnNob3dQb3BvdmVyID09PSAnZnVuY3Rpb24nO1xuICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLnNldEF0dHJpYnV0ZSgncG9wb3ZlcicsICdtYW51YWwnKTtcbiAgICBlbHNlIHRvb2x0aXAuaGlkZGVuID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvb2x0aXApO1xuXG4gICAgbGV0IGFuY2hvcjogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBnZXRIZWxwID0gKHRhcmdldDogRXZlbnRUYXJnZXQgfCBudWxsKSA9PlxuICAgICAgICB0YXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ID8gdGFyZ2V0LmNsb3Nlc3Q8SFRNTEVsZW1lbnQ+KCdbZGF0YS1zZXR0aW5nLWhlbHBdJykgOiBudWxsO1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFuY2hvcikgcmV0dXJuO1xuICAgICAgICBhbmNob3IucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5Jyk7XG4gICAgICAgIGFuY2hvciA9IG51bGw7XG4gICAgICAgIGlmIChwb3BvdmVyKSB0b29sdGlwLmhpZGVQb3BvdmVyKCk7XG4gICAgICAgIGVsc2UgdG9vbHRpcC5oaWRkZW4gPSB0cnVlO1xuICAgIH07XG4gICAgY29uc3Qgc2hvdyA9IChoZWxwOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoYW5jaG9yID09PSBoZWxwKSByZXR1cm47XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICAgIGFuY2hvciA9IGhlbHA7XG4gICAgICAgIGhlbHAuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgdG9vbHRpcElkKTtcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGhlbHAuZGF0YXNldC5zZXR0aW5nSGVscCA/PyAnJztcbiAgICAgICAgaWYgKHBvcG92ZXIpIHRvb2x0aXAuc2hvd1BvcG92ZXIoKTtcbiAgICAgICAgZWxzZSB0b29sdGlwLmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IGhlbHAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0V2lkdGgsIG9mZnNldEhlaWdodCB9ID0gdG9vbHRpcDtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oYm91bmRzLmxlZnQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAtIG9mZnNldFdpZHRoIC0gOCkpICsgJ3B4JztcbiAgICAgICAgY29uc3QgYmVsb3cgPSBib3VuZHMuYm90dG9tICsgNjtcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSAoYmVsb3cgKyBvZmZzZXRIZWlnaHQgPD0gd2luZG93LmlubmVySGVpZ2h0IC0gOFxuICAgICAgICAgICAgPyBiZWxvdyA6IE1hdGgubWF4KDgsIGJvdW5kcy50b3AgLSBvZmZzZXRIZWlnaHQgLSA2KSkgKyAncHgnO1xuICAgIH07XG5cbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyb3ZlcicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgJiYgZXZlbnQucG9pbnRlclR5cGUgIT09ICd0b3VjaCcpIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm91dCcsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHAgPT09IGFuY2hvciAmJiBoZWxwICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGhlbHApIGNsb3NlKCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGhlbHApIHNob3coaGVscCk7XG4gICAgfSk7XG4gICAgcGFuZWwuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChnZXRIZWxwKGV2ZW50LnRhcmdldCkgPT09IGFuY2hvcikgY2xvc2UoKTtcbiAgICB9KTtcbiAgICBwYW5lbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgaGVscCA9IGdldEhlbHAoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKCFoZWxwKSByZXR1cm47XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzaG93KGhlbHApO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGhlbHAgPSBnZXRIZWxwKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChoZWxwICYmIChldmVudC5rZXkgPT09ICdFbnRlcicgfHwgZXZlbnQua2V5ID09PSAnICcpKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzaG93KGhlbHApO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2hvciAmJiBldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGdldEhlbHAoZXZlbnQudGFyZ2V0KSAhPT0gYW5jaG9yKSBjbG9zZSgpO1xuICAgIH0pO1xuICAgIHBhbmVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGNsb3NlLCB7IHBhc3NpdmU6IHRydWUgfSk7XG59XG4iLCAiLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIlVsdHJvblwiXSAucGFuZWwtY29udGVudHMge1xuICAgIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xuICAgIGFsaWduLWl0ZW1zOiBzdGFydDtcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgIG92ZXJzY3JvbGwtYmVoYXZpb3I6IGNvbnRhaW47XG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWw6aGFzKD4gLmdyb3VwLXBhbmVsW3JlbD1cIlVsdHJvblwiXS5zaG93bikge1xuICAgIG92ZXJmbG93OiBjbGlwO1xufVxuLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgLmdyb3VwLXBhbmVsW3JlbD1cIlVsdHJvblwiXSAuY29uZmlnLXNldHRpbmcuaGFzLXN1YnNldHRpbmdzIHtcbiAgICBncmlkLXJvdy1lbmQ6IGF1dG87XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAuZ3JvdXAtcGFuZWxbcmVsPVwiVWx0cm9uXCJdIC51bHRyb24tcGFja2VkLXNldHRpbmdzIHtcbiAgICBncmlkLWF1dG8tZmxvdzogcm93IGRlbnNlO1xuICAgIGdyaWQtYXV0by1yb3dzOiAxcHg7XG4gICAgcm93LWdhcDogMDtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJVbHRyb25cIl0gLnVsdHJvbi1wYWNrZWQtc2V0dGluZ3MgLmNvbmZpZy1zZXR0aW5nIHtcbiAgICBncmlkLXJvdy1lbmQ6IHNwYW4gdmFyKC0tdWx0cm9uLXNldHRpbmctcm93cywgMSk7XG59XG4uaGgtcGx1cy1wbHVzLWNvbmZpZy1wYW5lbCAudGFicyBoNFtyZWw9XCJVbHRyb25cIl0ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC50YWJzIGg0W3JlbD1cIlVsdHJvblwiXS5zZWxlY3RlZDo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6IHZhcigtLXVsdHJvbi12ZXJzaW9uKTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgaW5zZXQtYmxvY2stc3RhcnQ6IDA7XG4gICAgaW5zZXQtaW5saW5lLWVuZDogLjE1cmVtO1xuICAgIGZvbnQtc2l6ZTogLjYyNXJlbTtcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgIGxpbmUtaGVpZ2h0OiAxO1xuICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmlyb25tYW4tc2V0dGluZy1oZWxwIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtZ3JpZDtcbiAgICBwbGFjZS1pdGVtczogY2VudGVyO1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgaW5saW5lLXNpemU6IDEuMjVlbTtcbiAgICBibG9jay1zaXplOiAxLjI1ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICBmb250LXNpemU6IC44ZW07XG4gICAgbGluZS1oZWlnaHQ6IDE7XG4gICAgdmVydGljYWwtYWxpZ246IC4wOGVtO1xuICAgIGN1cnNvcjogaGVscDtcbn1cbi5pcm9ubWFuLXNldHRpbmctaGVscDpob3Zlcixcbi5pcm9ubWFuLXNldHRpbmctaGVscDpmb2N1cy12aXNpYmxlIHtcbiAgICBvdXRsaW5lOiAxcHggc29saWQgY3VycmVudENvbG9yO1xuICAgIG91dGxpbmUtb2Zmc2V0OiAycHg7XG59XG4uaXJvbm1hbi1zZXR0aW5nLXRvb2x0aXAge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBpbnNldDogYXV0bztcbiAgICB6LWluZGV4OiAxMDAxMDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIG1heC13aWR0aDogbWluKDE4cmVtLCBjYWxjKDEwMHZ3IC0gMTZweCkpO1xuICAgIG1hcmdpbjogMDtcbiAgICBwYWRkaW5nOiAuNWVtIC43ZW07XG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29uZmlnLXNldHRpbmctYm9yZGVyLCAjYTlhM2JjKTtcbiAgICBib3JkZXItcmFkaXVzOiAuNGVtO1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvbmZpZy1zZXR0aW5nLWJhY2tncm91bmQsICMyNDFlMzApO1xuICAgIGNvbG9yOiAjZmZmO1xuICAgIGZvbnQ6IDE0cHgvMS40IHN5c3RlbS11aSwgc2Fucy1zZXJpZjtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbiIsICJpbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBtb3VudFNldHRpbmdzSGVscCB9IGZyb20gJy4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCBjc3MgZnJvbSAnLi9zZXR0aW5ncy5jc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U3R5bGVzKCkge1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5jbGFzc05hbWUgPSAnaGgtdWx0cm9uLXN0eWxlJztcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGAke2Nzc31cbiAgICAgICAgLmhoLXBsdXMtcGx1cy1jb25maWctcGFuZWwgeyAtLXVsdHJvbi12ZXJzaW9uOiBcInYke1VTRVJTQ1JJUFRfVkVSU0lPTn1cIjsgfVxuICAgIGA7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWNrU2V0dGluZ3MoKSB7XG4gICAgaWYgKGN1cnJlbnRQYWdlICE9PSAnL2hvbWUuaHRtbCcpIHJldHVybjtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5oaC1wbHVzLXBsdXMtY29uZmlnLXBhbmVsIC5ncm91cC1wYW5lbFtyZWw9XCJVbHRyb25cIl0gLnBhbmVsLWNvbnRlbnRzJztcbiAgICB3aW5kb3cuSEhQbHVzUGx1cy5IZWxwZXJzLmRvV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oc2VsZWN0b3IpO1xuICAgICAgICBpZiAoIXBhbmVsKSByZXR1cm47XG4gICAgICAgIHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hoLXNjcm9sbCcpO1xuICAgICAgICBtb3VudFNldHRpbmdzSGVscChwYW5lbCwgJ3VsdHJvbi1zZXR0aW5nLXRvb2x0aXAnKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlKSB8fCAhcGFuZWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCB1bml0ID0gZXZlbnQuZGVsdGFNb2RlID09PSAxID8gMTYgOiBldmVudC5kZWx0YU1vZGUgPT09IDIgPyBwYW5lbC5jbGllbnRIZWlnaHQgOiAxO1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBwYW5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgLyBwYW5lbC5vZmZzZXRIZWlnaHQgfHwgMTtcbiAgICAgICAgICAgIHBhbmVsLnNjcm9sbFRvcCArPSBldmVudC5kZWx0YVkgKiB1bml0IC8gc2NhbGU7XG4gICAgICAgIH0sIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogZmFsc2UgfSk7XG5cbiAgICAgICAgY29uc3QgY2FyZHMgPSBwYW5lbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLmNvbmZpZy1zZXR0aW5nJyk7XG4gICAgICAgIGNvbnN0IHBhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXBhbmVsLm9mZnNldFdpZHRoKSByZXR1cm47XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuICAgICAgICAgICAgICAgIGNhcmQuc3R5bGUuc2V0UHJvcGVydHkoJy0tdWx0cm9uLXNldHRpbmctcm93cycsIFN0cmluZyhjYXJkLm9mZnNldEhlaWdodCArIDEwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYW5lbC5jbGFzc0xpc3QuYWRkKCd1bHRyb24tcGFja2VkLXNldHRpbmdzJyk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGdyb3VwT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihwYWNrKTtcbiAgICAgICAgaWYgKHBhbmVsLnBhcmVudEVsZW1lbnQpIGdyb3VwT2JzZXJ2ZXIub2JzZXJ2ZShwYW5lbC5wYXJlbnRFbGVtZW50LCB7IGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcyddIH0pO1xuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc3Qgc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHBhY2spO1xuICAgICAgICAgICAgY2FyZHMuZm9yRWFjaChjYXJkID0+IHNpemVPYnNlcnZlci5vYnNlcnZlKGNhcmQpKTtcbiAgICAgICAgfVxuICAgICAgICBwYWNrKCk7XG4gICAgfSk7XG59XG4iLCAiZXhwb3J0IHR5cGUgTW9kdWxlU2V0dGluZ3MgPSBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcblxuaW50ZXJmYWNlIENvbmZpZ1NjaGVtYSB7XG4gICAgYmFzZUtleTogc3RyaW5nO1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgZGVmYXVsdDogYm9vbGVhbjtcbiAgICBzdWJTZXR0aW5ncz86IHsga2V5OiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGRlZmF1bHQ6IGJvb2xlYW4gfVtdO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSEhNb2R1bGUge1xuICAgIHJlYWRvbmx5IGdyb3VwID0gJ1VsdHJvbic7XG4gICAgcmVhZG9ubHkgY29uZmlnU2NoZW1hOiBDb25maWdTY2hlbWE7XG4gICAgaGFzUnVuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcih7IGNvbmZpZ1NjaGVtYSB9OiB7IG5hbWU6IHN0cmluZzsgY29uZmlnU2NoZW1hOiBDb25maWdTY2hlbWEgfSkge1xuICAgICAgICB0aGlzLmNvbmZpZ1NjaGVtYSA9IGNvbmZpZ1NjaGVtYTtcbiAgICB9XG5cbiAgICBhYnN0cmFjdCBzaG91bGRSdW4oKTogYm9vbGVhbjtcbiAgICBhYnN0cmFjdCBydW4oc2V0dGluZ3M6IE1vZHVsZVNldHRpbmdzKTogdm9pZCB8IFByb21pc2U8dm9pZD47XG59XG4iLCAiaW50ZXJmYWNlIE9ic2VydmVyT3B0aW9ucyB7XG4gICAgb25jZT86IGJvb2xlYW47XG4gICAgdGltZW91dD86IG51bWJlciB8IG51bGw7XG59XG5cbnR5cGUgQ2xpY2tEZWxheSA9IG51bWJlciB8IFtudW1iZXIsIG51bWJlcl07XG5pbnRlcmZhY2UgQ2xpY2tPcHRpb25zIGV4dGVuZHMgT2JzZXJ2ZXJPcHRpb25zIHtcbiAgICBkZWxheT86IENsaWNrRGVsYXk7XG59XG5cbmludGVyZmFjZSBQb3B1cE9wdGlvbnMgZXh0ZW5kcyBDbGlja09wdGlvbnMge1xuICAgIHRyaWdnZXJTZWxlY3Rvcj86IHN0cmluZztcbiAgICB0YXJnZXRTZWxlY3Rvcj86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gb2JzZXJ2ZVVudGlsKHNlbGVjdG9yOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudHM6IE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+KSA9PiB2b2lkLFxuICAgIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH06IE9ic2VydmVyT3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KHNlbGVjdG9yKTtcbiAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgaWYgKG9uY2UpIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihzZWxlY3Rvcik7XG4gICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aW1lcikgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKGVsZW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICAgIC8vIFBhc3MgYHRpbWVvdXQ6IG51bGxgIChvciBhbnkgbm9uLWZpbml0ZSB2YWx1ZSkgdG8gZGlzYWJsZSB0aGUgdGltZW91dFxuICAgIGlmICh0aW1lb3V0ICE9PSBudWxsICYmIE51bWJlci5pc0Zpbml0ZSh0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKHNlbGVjdG9yOiBzdHJpbmcsIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH06IE9ic2VydmVyT3B0aW9ucyA9IHt9KSB7XG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yLCAoZWxlbWVudHMpID0+IHtcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9KTtcbiAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG59XG5cbmZ1bmN0aW9uIGlzVmlzaWJsZTxUIGV4dGVuZHMgRWxlbWVudD4oZWw6IFQgfCBudWxsKTogZWwgaXMgVCB7XG4gICAgcmV0dXJuICEhKGVsPy5pc0Nvbm5lY3RlZCAmJiBlbC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCAmJlxuICAgICAgICAhZWwuY2xvc2VzdCgnW2hpZGRlbl0sIFtpbmVydF0sIFthcmlhLWhpZGRlbj1cInRydWVcIl0nKSAmJiBnZXRDb21wdXRlZFN0eWxlKGVsKS52aXNpYmlsaXR5ID09PSAndmlzaWJsZScpO1xufVxuXG5mdW5jdGlvbiBpc0NsaWNrYWJsZTxUIGV4dGVuZHMgRWxlbWVudD4oZWw6IFQgfCBudWxsKTogZWwgaXMgVCB7XG4gICAgcmV0dXJuIGlzVmlzaWJsZShlbCkgJiYgIWVsLm1hdGNoZXMoJzpkaXNhYmxlZCwgLmRpc2FibGVkLCBbYXJpYS1kaXNhYmxlZD1cInRydWVcIl0nKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2xpY2tEZWxheShkZWxheTogQ2xpY2tEZWxheSkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KGRlbGF5KVxuICAgICAgICA/IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChkZWxheVsxXSAtIGRlbGF5WzBdICsgMSkpICsgZGVsYXlbMF1cbiAgICAgICAgOiBkZWxheTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyxcbiAgICB7IHRyaWdnZXJTZWxlY3RvciwgdGFyZ2V0U2VsZWN0b3IgPSAnLmNsb3NhYmxlJywgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwLCBkZWxheSA9IDAgfTogUG9wdXBPcHRpb25zID0ge30pIHtcbiAgICBsZXQgY29udGFpbmVyOiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGFjdGl2ZVBvcHVwOiBFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGNsaWNrZWQgPSBmYWxzZTtcbiAgICBsZXQgcGVuZGluZzogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGV4cGlyeTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgY29uc3QgZ2V0QWN0aXZlUG9wdXAgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgIGlmICghaXNWaXNpYmxlKHBvcHVwKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICh0cmlnZ2VyU2VsZWN0b3IgJiYgIUFycmF5LmZyb20ocG9wdXAucXVlcnlTZWxlY3RvckFsbCh0cmlnZ2VyU2VsZWN0b3IpKS5zb21lKGVsZW1lbnQgPT4gaXNWaXNpYmxlKGVsZW1lbnQpKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBwb3B1cDtcbiAgICB9O1xuXG4gICAgY29uc3QgZ2V0VGFyZ2V0ID0gKHBvcHVwOiBFbGVtZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldHMgPSBBcnJheS5mcm9tKHBvcHVwLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KHRhcmdldFNlbGVjdG9yKSkuZmlsdGVyKGVsZW1lbnQgPT4gaXNDbGlja2FibGUoZWxlbWVudCkpO1xuICAgICAgICByZXR1cm4gdGFyZ2V0cy5sZW5ndGggPT09IDEgPyB0YXJnZXRzWzBdIDogbnVsbDtcbiAgICB9O1xuXG4gICAgY29uc3QgY2hlY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICBjb25zdCBwb3B1cCA9IGdldEFjdGl2ZVBvcHVwKCk7XG4gICAgICAgIGlmIChwb3B1cCAhPT0gYWN0aXZlUG9wdXApIHtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nICE9PSBudWxsKSBjbGVhclRpbWVvdXQocGVuZGluZyk7XG4gICAgICAgICAgICBwZW5kaW5nID0gbnVsbDtcbiAgICAgICAgICAgIGNsaWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGFjdGl2ZVBvcHVwID0gcG9wdXA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwb3B1cCB8fCBjbGlja2VkIHx8IHBlbmRpbmcgIT09IG51bGwgfHwgIWdldFRhcmdldChwb3B1cCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBjbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgIHBlbmRpbmcgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGdldEFjdGl2ZVBvcHVwKCkgIT09IHBvcHVwKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXRUYXJnZXQocG9wdXApO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpIHJldHVybjtcblxuICAgICAgICAgICAgY2xpY2tlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAob25jZSkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoZXhwaXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhcmdldC5jbGljaygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGNvbXB1dGVkRGVsYXkgPSBnZXRDbGlja0RlbGF5KGRlbGF5KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkRGVsYXkgPiAwKSBwZW5kaW5nID0gc2V0VGltZW91dChjbGljaywgY29tcHV0ZWREZWxheSk7XG4gICAgICAgIGVsc2UgY2xpY2soKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGN1cnJlbnQgIT09IGNvbnRhaW5lciB8fCAoY3VycmVudCAmJiBtdXRhdGlvbnMuc29tZSgoeyB0YXJnZXQgfSkgPT4gY3VycmVudC5jb250YWlucyh0YXJnZXQpIHx8IHRhcmdldC5jb250YWlucyhjdXJyZW50KSkpKSBjaGVjaygpO1xuICAgIH0pO1xuICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJywgJ3N0eWxlJywgJ2hpZGRlbicsICdpbmVydCcsICdhcmlhLWhpZGRlbicsICdkaXNhYmxlZCcsICdhcmlhLWRpc2FibGVkJ11cbiAgICB9KTtcbiAgICBpZiAodGltZW91dCAhPT0gbnVsbCAmJiBOdW1iZXIuaXNGaW5pdGUodGltZW91dCkgJiYgdGltZW91dCA+IDApIGV4cGlyeSA9IHNldFRpbWVvdXQoKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpLCB0aW1lb3V0KTtcbiAgICBjaGVjaygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUoc2VsZWN0b3I6IHN0cmluZywgY2xhc3NUb1JlbW92ZTogc3RyaW5nLFxuICAgIHsgb25jZSA9IHRydWUsIHRpbWVvdXQgPSA1MDAwIH06IE9ic2VydmVyT3B0aW9ucyA9IHt9KSB7XG4gICAgb2JzZXJ2ZVVudGlsKHNlbGVjdG9yLCAoZWxlbWVudHMpID0+IHtcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzVG9SZW1vdmUpKTtcbiAgICB9LCB7IHRpbWVvdXQsIG9uY2UgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGlja1doZW5TZWxlY3RvckF2YWlsYWJsZShzZWxlY3Rvcjogc3RyaW5nLCBlbGVtZW50VG9DbGljazogc3RyaW5nLFxuICAgIHsgZGVsYXkgPSAyMDAwLCBvbmNlID0gdHJ1ZSwgdGltZW91dCA9IDUwMDAgfTogQ2xpY2tPcHRpb25zID0ge30pIHtcbiAgICBsZXQgcGVuZGluZyA9IGZhbHNlO1xuICAgIGxldCBoYXNDbGlja2VkID0gZmFsc2U7XG5cbiAgICBvYnNlcnZlVW50aWwoc2VsZWN0b3IsICgpID0+IHtcbiAgICAgICAgaWYgKGhhc0NsaWNrZWQgfHwgcGVuZGluZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNsb3NlRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KGVsZW1lbnRUb0NsaWNrKTtcbiAgICAgICAgaWYgKGlzQ2xpY2thYmxlKGNsb3NlRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHBlbmRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDbGlja2FibGUoY2xvc2VFbGVtZW50KSAmJiBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKS5zb21lKGVsZW1lbnQgPT4gaXNWaXNpYmxlKGVsZW1lbnQpKSkge1xuICAgICAgICAgICAgICAgICAgICBoYXNDbGlja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VFbGVtZW50LmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZ2V0Q2xpY2tEZWxheShkZWxheSkpO1xuICAgICAgICB9XG4gICAgfSwgeyB0aW1lb3V0LCBvbmNlIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BhY2ViYXJUb0NsaWNrKHNlbGVjdG9yczogeyBzZWxlY3Rvcjogc3RyaW5nOyB0cmlnZ2VyU2VsZWN0b3I/OiBzdHJpbmcgfVtdKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICAgIGlmIChlLmtleSAhPT0gJyAnICYmIGUuY29kZSAhPT0gJ1NwYWNlJykgcmV0dXJuO1xuICAgICAgICBpZiAoZS5kZWZhdWx0UHJldmVudGVkIHx8IGUucmVwZWF0IHx8IGUuaXNDb21wb3NpbmcgfHwgZS5hbHRLZXkgfHwgZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG4gICAgICAgIGlmIChlLnRhcmdldCBpbnN0YW5jZW9mIEVsZW1lbnQgJiZcbiAgICAgICAgICAgIGUudGFyZ2V0LmNsb3Nlc3QoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBidXR0b24sIGFbaHJlZl0sIFtyb2xlPVwiYnV0dG9uXCJdLCBbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKScpKSByZXR1cm47XG5cbiAgICAgICAgZm9yIChjb25zdCB7IHNlbGVjdG9yLCB0cmlnZ2VyU2VsZWN0b3IgfSBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGlmICh0cmlnZ2VyU2VsZWN0b3IgJiYgIUFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0cmlnZ2VyU2VsZWN0b3IpKS5zb21lKGVsZW1lbnQgPT4gaXNWaXNpYmxlKGVsZW1lbnQpKSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkuZmlsdGVyKGVsZW1lbnQgPT4gaXNDbGlja2FibGUoZWxlbWVudCkpO1xuICAgICAgICAgICAgaWYgKHRhcmdldHMubGVuZ3RoICE9PSAxKSBjb250aW51ZTtcblxuICAgICAgICAgICAgY29uc3QgW2VsXSA9IHRhcmdldHM7XG4gICAgICAgICAgICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCBwb3NYID0gcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCAvIDI7XG4gICAgICAgICAgICBjb25zdCBwb3NZID0gcmVjdC50b3AgKyByZWN0LmhlaWdodCAvIDI7XG4gICAgICAgICAgICBpZiAoIWVsLmNvbnRhaW5zKGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQocG9zWCwgcG9zWSkpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7XG4gICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjbGllbnRYOiBwb3NYLCBjbGllbnRZOiBwb3NZLFxuICAgICAgICAgICAgICAgIHNjcmVlblg6IHBvc1gsIHNjcmVlblk6IHBvc1l9KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSwgcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUsIGNsaWNrV2hlblNlbGVjdG9yQXZhaWxhYmxlIH0gZnJvbSAnLi4vLi4vZG9tJztcblxuZXhwb3J0IGNsYXNzIFJlbW92ZUFEcyBleHRlbmRzIEhITW9kdWxlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgYmFzZUtleSA9ICdyZW1vdmVBRHMnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkhpZGUgYWRzXCIsIFwiSGlkZSBhZCBwbGFjZW1lbnRzIG9uIHN1cHBvcnRlZCBnYW1lIHBhZ2VzLlwiKSxcbiAgICAgICAgICAgIHN1YlNldHRpbmdzOiBbe1xuICAgICAgICAgICAgICAgIGtleTogJ2Nsb3NlX2hvbWUnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkhvbWVwYWdlIGFkc1wiLCBcIkRpc21pc3MgZWxpZ2libGUgaG9tZXBhZ2UgYWRzIGFuZCBrZWVwIHRoZSBrb2JhbiBjb2xsZWN0aW9uIG9wdGlvbi5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYWN0aXZpdGllcy5odG1sJykgfHxcbiAgICAgICAgKC9cXC9xdWVzdFxcL1xcZCskLy50ZXN0KGN1cnJlbnRQYWdlKSkgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ib3NzLWJhbmctYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2NoYW1waW9ucy1tYXAuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvZ29kLXBhdGguaHRtbCcpIHx8XG4gICAgICAgICgvXFwvY2hhcmFjdGVyc1xcL1xcZCskLy50ZXN0KGN1cnJlbnRQYWdlKSkgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ob21lLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGgtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC1wcmUtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZS1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbG92ZS1yYWlkcy5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYW50aGVvbi1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvc2Vhc29uLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3NlYXNvbi1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvc2hvcC5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy90cm9sbC1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvd29ybGQtYm9zcy1iYXR0bGUuaHRtbCcpXG4gICAgfVxuXG4gICAgcnVuKHsgY2xvc2VfaG9tZSB9OiBNb2R1bGVTZXR0aW5ncykge1xuICAgICAgICBpZiAodGhpcy5oYXNSdW4gfHwgIXRoaXMuc2hvdWxkUnVuKCkpIHtyZXR1cm59XG5cbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYWN0aXZpdGllcy5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJy5hZC1yZXZpdmUtY29udGFpbmVyJywgeyBvbmNlOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuaGVpZ2h0LWZvci1hZCcsICdoZWlnaHQtZm9yLWFkJywgeyBvbmNlOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICgvXFwvcXVlc3RcXC9cXGQrJC8udGVzdChjdXJyZW50UGFnZSkpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9xdWVzdCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYm9zcy1iYW5nLWJhdHRsZS5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9iYXR0bGUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2NoYW1waW9ucy1tYXAuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfY2hhbXBpb25zX21hcCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvZ29kLXBhdGguaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfZ29kLXBhdGgnKTtcbiAgICAgICAgfSBlbHNlIGlmICgvXFwvY2hhcmFjdGVyc1xcL1xcZCskLy50ZXN0KGN1cnJlbnRQYWdlKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2hhcmVtJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ob21lLmh0bWwnKSkge1xuICAgICAgICAgICAgaWYgKGNsb3NlX2hvbWUpIGNsaWNrV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcuYmVjb21lLW1lbWJlci10ZXh0JywgJ2Nsb3NlJywgeyBkZWxheTogWzUwMCwgMTUwMF0sIG9uY2U6IGZhbHNlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2xhYnlyaW50aCcsIHsgb25jZTogZmFsc2UsIHRpbWVvdXQ6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGgtYmF0dGxlLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2JhdHRsZScpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGFieXJpbnRoLXByZS1iYXR0bGUuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfbGFieXJpbnRoLXByZS1iYXR0bGUnLCB7IG9uY2U6IGZhbHNlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3VlLWJhdHRsZS5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9iYXR0bGUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xvdmUtcmFpZHMuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfbG92ZV9yYWlkcycpO1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3NXaGVuU2VsZWN0b3JBdmFpbGFibGUoJy5oZWlnaHQtZm9yLWFkJywgJ2hlaWdodC1mb3ItYWQnLCB7IG9uY2U6IGZhbHNlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGFudGhlb24tYmF0dGxlLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2JhdHRsZScpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvc2Vhc29uLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX3NlYXNvbicpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvc2Vhc29uLWJhdHRsZS5odG1sJykpIHtcbiAgICAgICAgICAgIGhpZGVXaGVuU2VsZWN0b3JBdmFpbGFibGUoJyNhZF9iYXR0bGUnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL3Nob3AuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfc2hvcCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvdHJvbGwtYmF0dGxlLmh0bWwnKSkge1xuICAgICAgICAgICAgaGlkZVdoZW5TZWxlY3RvckF2YWlsYWJsZSgnI2FkX2JhdHRsZScpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvd29ybGQtYm9zcy1iYXR0bGUuaHRtbCcpKSB7XG4gICAgICAgICAgICBoaWRlV2hlblNlbGVjdG9yQXZhaWxhYmxlKCcjYWRfYmF0dGxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgc2V0dGluZ0hlbHAgfSBmcm9tICcuLi8uLi9zZXR0aW5nc0hlbHAnO1xuaW1wb3J0IHsgSEhNb2R1bGUgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSB9IGZyb20gJy4uLy4uL2dhbWUnO1xuaW1wb3J0IHsgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lciB9IGZyb20gJy4uLy4uL2RvbSc7XG5cbmV4cG9ydCBjbGFzcyBIaWRlUG9wdXBzIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2hpZGVQb3B1cHMnXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlNob3AgYW5kIG5ld3MgcG9wdXBzXCIsIFwiRGlzbWlzcyBzaG9wIGFuZCBuZXdzIHBvcHVwcyB0aGF0IG9wZW4gd2l0aGluIHRoZSBmaXJzdCB0d28gc2Vjb25kcy5cIiksXG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe25hbWU6IGJhc2VLZXksIGNvbmZpZ1NjaGVtYX0pO1xuICAgIH1cblxuICAgIHNob3VsZFJ1bigpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvaG9tZS5odG1sJylcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjbm9fSEMnLCB7IHRpbWVvdXQ6IDIwMDAgfSk7XG4gICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNuZXdzX2RldGFpbHNfcG9wdXAnLCB7IHRhcmdldFNlbGVjdG9yOiAnLmJhY2tfYnV0dG9uJywgdGltZW91dDogMjAwMCB9KTtcbiAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3BvcHVwX25ld3MnLCB7IHRpbWVvdXQ6IDIwMDAgfSk7XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyIH0gZnJvbSAnLi4vLi4vZG9tJztcblxuZXhwb3J0IGNsYXNzIENsb3NlUG9wdXBzIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ2Nsb3NlUG9wdXBzJ1xuICAgICAgICBjb25zdCBjb25maWdTY2hlbWEgPSB7XG4gICAgICAgICAgICBiYXNlS2V5LFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJTZWxlY3RlZCBwb3B1cHNcIiwgXCJEaXNtaXNzIHNlbGVjdGVkIHBvcHVwcyBvbiB0aGUgaG9tZXBhZ2Ugb3Igc2Vhc29uIHBhZ2UuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnaG9tZXBhZ2UnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkhvbWVwYWdlXCIsIFwiRGlzbWlzcyBlbGlnaWJsZSBzaG9wLCBuZXdzLCBhbmQgc3BlY2lhbCBvZmZlciBwb3B1cHMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdzZWFzb24nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIlNlYXNvblwiLCBcIkRpc21pc3MgdGhlIHNlYXNvbiBwYXNzIHJlbWluZGVyLlwiKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7bmFtZTogYmFzZUtleSwgY29uZmlnU2NoZW1hfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkUnVuKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ob21lLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL3NlYXNvbi5odG1sJylcbiAgICB9XG5cbiAgICBydW4oeyBob21lcGFnZSwgc2Vhc29uIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9ob21lLmh0bWwnKSAmJiBob21lcGFnZSkge1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI25vX0hDJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI25ld3NfZGV0YWlsc19wb3B1cCcsIHsgdGFyZ2V0U2VsZWN0b3I6ICcuYmFja19idXR0b24nLCB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3BvcHVwX25ld3MnLCB7IHRpbWVvdXQ6IDIwMDAsIGRlbGF5OiBbMjUwLDMwMF0gfSk7XG4gICAgICAgICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjdHJpYWxfbW9udGhseV9jYXJkX3BvcHVwJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3VuaXF1ZV9kZWFsX3BvcHVwJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvc2Vhc29uLmh0bWwnKSAmJiBzZWFzb24pIHtcbiAgICAgICAgICAgIGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIoJyNwYXNzX3JlbWluZGVyX3BvcHVwJywgeyB0aW1lb3V0OiAyMDAwLCBkZWxheTogWzI1MCwzMDBdIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oYXNSdW4gPSB0cnVlXG4gICAgfVxufVxuIiwgImltcG9ydCB7IHNldHRpbmdIZWxwIH0gZnJvbSAnLi4vLi4vc2V0dGluZ3NIZWxwJztcbmltcG9ydCB7IEhITW9kdWxlIH0gZnJvbSAnLi4vLi4vSEhNb2R1bGUnO1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVTZXR0aW5ncyB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB7IGN1cnJlbnRQYWdlLCByZXdhcmRCdXR0b24gfSBmcm9tICcuLi8uLi9nYW1lJztcbmltcG9ydCB7IGNsb3NlVGFyZ2V0V2hlblRyaWdnZXJBdmFpbGFibGVJbnNpZGVDb250YWluZXIgfSBmcm9tICcuLi8uLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgQXV0b0NvbmZpcm0gZXh0ZW5kcyBISE1vZHVsZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VLZXkgPSAnYXV0b0NvbmZpcm0nXG4gICAgICAgIGNvbnN0IGNvbmZpZ1NjaGVtYSA9IHtcbiAgICAgICAgICAgIGJhc2VLZXksXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkF1dG8tY29uZmlybSBkaWFsb2dzXCIsIFwiQ2xvc2UgZWxpZ2libGUgYmF0dGxlIGFuZCByZXdhcmQgZGlhbG9ncyBpbiB0aGUgc2VsZWN0ZWQgbW9kZXMuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnZGFkZHlyaW50aFJlbGljJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMYWJ5cmludGggcmVsaWNzXCIsIFwiQ29uZmlybSB0aGUgcmVsaWMgcmV3YXJkIGRpYWxvZy5cIiksXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICdsZWFndWVXaW4nLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nSGVscChcIkxlYWd1ZSB3aW5zXCIsIFwiQ2xvc2UgdGhlIGxlYWd1ZSB2aWN0b3J5IHJld2FyZCBkaWFsb2cuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICAvLyB9LCB7XG4gICAgICAgICAgICAvLyAgICAga2V5OiAnbGVhZ3VlTG9zcycsXG4gICAgICAgICAgICAvLyAgICAgbGFiZWw6IGBMZWFndWUgbG9zcyBjb25maXJtYXRpb25gLFxuICAgICAgICAgICAgLy8gICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAncGFudGhlb25Mb3NzJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJQYW50aGVvbiBsb3NzZXNcIiwgXCJDbG9zZSB0aGUgUGFudGhlb24gbG9zcyBkaWFsb2cuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWVzLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZS1iYXR0bGUuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvcGFudGhlb24tYmF0dGxlLmh0bWwnKVxuICAgIH1cblxuICAgIHJ1bih7IGRhZGR5cmludGhSZWxpYywgbGVhZ3VlV2luLCBwYW50aGVvbkxvc3MgfTogTW9kdWxlU2V0dGluZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzUnVuIHx8ICF0aGlzLnNob3VsZFJ1bigpKSB7cmV0dXJufVxuXG4gICAgICAgIGlmIChjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC5odG1sJykgJiYgZGFkZHlyaW50aFJlbGljKSB7XG4gICAgICAgICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjbGFieXJpbnRoX3Jld2FyZF9wb3B1cCcsIHsgdGFyZ2V0U2VsZWN0b3I6ICcjY2xvc2UtcmVsaWMtcG9wdXAnLCB0aW1lb3V0OiBudWxsLCBkZWxheTogWzUwLDE1MF0gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJykgfHwgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWUtYmF0dGxlLmh0bWwnKSkgJiYgbGVhZ3VlV2luKSB7XG4gICAgICAgICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjcmV3YXJkc19wb3B1cCcsIHsgdHJpZ2dlclNlbGVjdG9yOiAnI3Jld2FyZF9ob2xkZXInLCB0YXJnZXRTZWxlY3RvcjogcmV3YXJkQnV0dG9uLCBvbmNlOiBmYWxzZSwgdGltZW91dDogbnVsbCwgZGVsYXk6IFs1MCwxNTBdIH0pO1xuICAgICAgICAvLyB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3Vlcy5odG1sJykgfHwgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWUtYmF0dGxlLmh0bWwnKSAmJiBsZWFndWVMb3NzKSB7XG4gICAgICAgIC8vICAgICBjbG9zZVRhcmdldFdoZW5UcmlnZ2VyQXZhaWxhYmxlSW5zaWRlQ29udGFpbmVyKCcjcmV3YXJkc19wb3B1cCcsIHsgdHJpZ2dlclNlbGVjdG9yOiAnI3VwZ3JhZGVfY2hhcmFjdGVycycsIHRhcmdldFNlbGVjdG9yOiByZXdhcmRCdXR0b24sIG9uY2U6IGZhbHNlLCB0aW1lb3V0OiBudWxsLCBkZWxheTogWzUwLDE1MF0gfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9wYW50aGVvbi1iYXR0bGUuaHRtbCcpICYmIHBhbnRoZW9uTG9zcykge1xuICAgICAgICAgICAgY2xvc2VUYXJnZXRXaGVuVHJpZ2dlckF2YWlsYWJsZUluc2lkZUNvbnRhaW5lcignI3Jld2FyZHNfcG9wdXAnLCB7IHRyaWdnZXJTZWxlY3RvcjogJy5sb3N0LWZpcnN0LXJvdycsIHRhcmdldFNlbGVjdG9yOiByZXdhcmRCdXR0b24sIHRpbWVvdXQ6IG51bGwsIGRlbGF5OiBbNTAsMTUwXSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGFzUnVuID0gdHJ1ZVxuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBzZXR0aW5nSGVscCB9IGZyb20gJy4uLy4uL3NldHRpbmdzSGVscCc7XG5pbXBvcnQgeyBISE1vZHVsZSB9IGZyb20gJy4uLy4uL0hITW9kdWxlJztcbmltcG9ydCB0eXBlIHsgTW9kdWxlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9ISE1vZHVsZSc7XG5pbXBvcnQgeyBjdXJyZW50UGFnZSwgcmV3YXJkQnV0dG9uIH0gZnJvbSAnLi4vLi4vZ2FtZSc7XG5pbXBvcnQgeyBzcGFjZWJhclRvQ2xpY2sgfSBmcm9tICcuLi8uLi9kb20nO1xuXG5leHBvcnQgY2xhc3MgU3BhY2ViYXJIZWxwIGV4dGVuZHMgSEhNb2R1bGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBiYXNlS2V5ID0gJ3NwYWNlYmFySGVscCdcbiAgICAgICAgY29uc3QgY29uZmlnU2NoZW1hID0ge1xuICAgICAgICAgICAgYmFzZUtleSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiU3BhY2ViYXIgc2hvcnRjdXRzXCIsIFwiVXNlIFNwYWNlIHRvIGNvbmZpcm0gZWxpZ2libGUgcmV3YXJkcyBhbmQgZGlhbG9ncyBpbiB0aGUgc2VsZWN0ZWQgbW9kZXMuXCIpLFxuICAgICAgICAgICAgc3ViU2V0dGluZ3M6IFt7XG4gICAgICAgICAgICAgICAga2V5OiAnZGFkZHlyaW50aFJlbGljJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMYWJ5cmludGggZmxvd1wiLCBcIlVzZSBTcGFjZSBvbiByZWxpY3MsIGhlYWwgZGlhbG9ncywgYW5kIGVsaWdpYmxlIHJld2FyZHMuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnZGFkZHlyaW50aEJhdHRsZScsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiTGFieXJpbnRoIGJhdHRsZXNcIiwgXCJVc2UgU3BhY2UgdG8gcGVyZm9ybSBhbmQgc2tpcCwgb3IgY29uZmlybSB3aGVuIHlvdSB3aW4uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnbGVhZ3VlQmF0dGxlJyxcbiAgICAgICAgICAgICAgICBsYWJlbDogc2V0dGluZ0hlbHAoXCJMZWFndWUgYmF0dGxlc1wiLCBcIlVzZSBTcGFjZSBvbiB0aGUgbGVhZ3VlIHJld2FyZCBjb25maXJtYXRpb24uXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiAnYWN0aXZpdGllc1Jld2FyZCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmdIZWxwKFwiQWN0aXZpdGllcyByZXdhcmRzXCIsIFwiVXNlIFNwYWNlIG9uIHRoZSBBY3Rpdml0aWVzIHJld2FyZCBkaWFsb2cuXCIpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtuYW1lOiBiYXNlS2V5LCBjb25maWdTY2hlbWF9KTtcbiAgICB9XG5cbiAgICBzaG91bGRSdW4oKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xhYnlyaW50aC5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGgtcHJlLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGgtYmF0dGxlLmh0bWwnKSB8fFxuICAgICAgICBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZXMuaHRtbCcpIHx8XG4gICAgICAgIGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvbGVhZ3VlLWJhdHRsZS5odG1sJykgfHxcbiAgICAgICAgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9hY3Rpdml0aWVzLmh0bWwnKVxuICAgIH1cblxuICAgIHJ1bih7IGRhZGR5cmludGhSZWxpYywgZGFkZHlyaW50aEJhdHRsZSwgbGVhZ3VlQmF0dGxlLCBhY3Rpdml0aWVzUmV3YXJkIH06IE1vZHVsZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1J1biB8fCAhdGhpcy5zaG91bGRSdW4oKSkge3JldHVybn1cblxuICAgICAgICBpZiAoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGguaHRtbCcpICYmIGRhZGR5cmludGhSZWxpYykge1xuICAgICAgICAgICAgc3BhY2ViYXJUb0NsaWNrKFtcbiAgICAgICAgICAgICAgICB7IHNlbGVjdG9yOiAnI2xhYnlyaW50aF9yZXdhcmRfcG9wdXAgI2Nsb3NlLXJlbGljLXBvcHVwJyB9LFxuICAgICAgICAgICAgICAgIHsgc2VsZWN0b3I6IGAjcmV3YXJkc19wb3B1cCAke3Jld2FyZEJ1dHRvbn1gIH0sXG4gICAgICAgICAgICAgICAgeyBzZWxlY3RvcjogJyNoZWFsX2dpcmxfbGFieXJpbnRoX3BvcHVwIGJ1dHRvbi5ibHVlX2J1dHRvbl9MJyB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSBlbHNlIGlmICgoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGgtcHJlLWJhdHRsZS5odG1sJykgfHwgY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sYWJ5cmludGgtYmF0dGxlLmh0bWwnKSkgJiYgZGFkZHlyaW50aEJhdHRsZSkge1xuICAgICAgICAgICAgc3BhY2ViYXJUb0NsaWNrKFtcbiAgICAgICAgICAgICAgICB7IHNlbGVjdG9yOiBgI3Jld2FyZHNfcG9wdXAgJHtyZXdhcmRCdXR0b259YCwgdHJpZ2dlclNlbGVjdG9yOiAnI3Jld2FyZHNfcG9wdXAgI3Jld2FyZF9ob2xkZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzZWxlY3RvcjogJyNwcmUtYmF0dGxlIC5ibHVlX2J1dHRvbl9MOm50aC1vZi10eXBlKDIpJyB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSBlbHNlIGlmICgoY3VycmVudFBhZ2UuaW5jbHVkZXMoJy9sZWFndWVzLmh0bWwnKSB8fCBjdXJyZW50UGFnZS5pbmNsdWRlcygnL2xlYWd1ZS1iYXR0bGUuaHRtbCcpKSAmJiBsZWFndWVCYXR0bGUpIHtcbiAgICAgICAgICAgIHNwYWNlYmFyVG9DbGljayhbeyBzZWxlY3RvcjogYCNyZXdhcmRzX3BvcHVwICR7cmV3YXJkQnV0dG9ufWAgfV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYWdlLmluY2x1ZGVzKCcvYWN0aXZpdGllcy5odG1sJykgJiYgYWN0aXZpdGllc1Jld2FyZCkge1xuICAgICAgICAgICAgc3BhY2ViYXJUb0NsaWNrKFt7IHNlbGVjdG9yOiBgI3Jld2FyZHNfcG9wdXAgJHtyZXdhcmRCdXR0b259YCB9XSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhhc1J1biA9IHRydWVcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgaW5pdEdhbWUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgaW5qZWN0U3R5bGVzLCBwYWNrU2V0dGluZ3MgfSBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCB7IFJlbW92ZUFEcyB9IGZyb20gJy4vbW9kdWxlcy9hZHMvUmVtb3ZlQURzJztcbmltcG9ydCB7IEhpZGVQb3B1cHMgfSBmcm9tICcuL21vZHVsZXMvcG9wdXBzL0hpZGVQb3B1cHMnO1xuaW1wb3J0IHsgQ2xvc2VQb3B1cHMgfSBmcm9tICcuL21vZHVsZXMvcG9wdXBzL0Nsb3NlUG9wdXBzJztcbmltcG9ydCB7IEF1dG9Db25maXJtIH0gZnJvbSAnLi9tb2R1bGVzL2JhdHRsZXMvQXV0b0NvbmZpcm0nO1xuaW1wb3J0IHsgU3BhY2ViYXJIZWxwIH0gZnJvbSAnLi9tb2R1bGVzL2tleWJvYXJkL1NwYWNlYmFySGVscCc7XG5cbmZ1bmN0aW9uIHJ1blVsdHJvbigpIHtcbiAgICBjb25zdCB7ICQgfSA9IHdpbmRvdztcblxuICAgIGlmICghJCkge1xuICAgICAgICBjb25zb2xlLmxvZygnV0FSTklORzogTm8galF1ZXJ5IGZvdW5kLiBQcm9iYWJseSBhbiBlcnJvciBwYWdlLiBFbmRpbmcgdGhlIHNjcmlwdCBoZXJlJylcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaW5pdEdhbWUoJCk7XG4gICAgaW5qZWN0U3R5bGVzKCk7XG5cbiAgICBjb25zdCBhbGxNb2R1bGVzID0gW1xuICAgICAgICBuZXcgUmVtb3ZlQURzKCksXG4gICAgICAgIG5ldyBIaWRlUG9wdXBzKCksXG4gICAgICAgIG5ldyBDbG9zZVBvcHVwcygpLFxuICAgICAgICBuZXcgQXV0b0NvbmZpcm0oKSxcbiAgICAgICAgbmV3IFNwYWNlYmFySGVscCgpXG4gICAgXVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJ1blNjcmlwdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaGhQbHVzUGx1c0NvbmZpZyB9ID0gd2luZG93XG4gICAgICAgICAgICBpZiAoIWhoUGx1c1BsdXNDb25maWcpIHJldHVybjtcblxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5yZWdpc3Rlckdyb3VwKHtcbiAgICAgICAgICAgICAgICBrZXk6ICdVbHRyb24nLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdISCBVbHRyb24nXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYWxsTW9kdWxlcy5mb3JFYWNoKG1vZHVsZSA9PiB7XG4gICAgICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5yZWdpc3Rlck1vZHVsZShtb2R1bGUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaGhQbHVzUGx1c0NvbmZpZy5sb2FkQ29uZmlnKClcbiAgICAgICAgICAgIGhoUGx1c1BsdXNDb25maWcucnVuTW9kdWxlcygpXG4gICAgICAgICAgICBwYWNrU2V0dGluZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3cuaGhQbHVzUGx1c0NvbmZpZykge1xuICAgICAgICAgICAgcnVuU2NyaXB0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uZSgnaGgrKy1iZHNtOmxvYWRlZCcsIHJ1blNjcmlwdClcbiAgICAgICAgfVxuICAgIH0sIDEpXG59XG5cbnJ1blVsdHJvbigpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLE1BQUk7QUFDSixNQUFJO0FBQ0osTUFBTSxlQUFlO0FBRXJCLFdBQVMsU0FBUyxRQUFzQjtBQUMzQyxRQUFJO0FBQ0osa0JBQWMsT0FBTyxTQUFTO0FBQUEsRUFDbEM7OztBQ1BPLFdBQVMsWUFBWSxPQUFlLGFBQXFCO0FBQzVELFVBQU0sU0FBUyxDQUFDLFNBQWlCLEtBQUssV0FBVyxLQUFLLE9BQU8sRUFBRSxXQUFXLEtBQUssUUFBUSxFQUNsRixXQUFXLEtBQUssTUFBTSxFQUFFLFdBQVcsS0FBSyxNQUFNO0FBQ25ELFdBQU8sT0FBTyxLQUFLLElBQUksc0ZBQ25CLE9BQU8sS0FBSyxJQUFJLDBCQUEwQixPQUFPLFdBQVcsSUFBSTtBQUFBLEVBQ3hFO0FBRU8sV0FBUyxrQkFBa0IsT0FBb0IsV0FBbUI7QUFDckUsVUFBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLFlBQVEsS0FBSztBQUNiLFlB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
