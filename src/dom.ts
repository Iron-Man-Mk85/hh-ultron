interface ObserverOptions {
    once?: boolean;
    timeout?: number | null;
}

type ClickDelay = number | [number, number];
interface ClickOptions extends ObserverOptions {
    delay?: ClickDelay;
}

interface PopupOptions extends ClickOptions {
    triggerSelector?: string;
    targetSelector?: string;
}

function observeUntil(selector: string, callback: (elements: NodeListOf<HTMLElement>) => void,
    { once = true, timeout = 5000 }: ObserverOptions = {}) {
    let timer: number | null = null;

    let elements = document.querySelectorAll<HTMLElement>(selector);
    if (elements.length) {
        callback(elements);
        if (once) return;
    }

    const observer = new MutationObserver(() => {
        elements = document.querySelectorAll<HTMLElement>(selector);
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
    if (timeout !== null && Number.isFinite(timeout) && timeout > 0) {
        timer = setTimeout(() => {
            observer.disconnect();
        }, timeout);
    }
}

export function hideWhenSelectorAvailable(selector: string, { once = true, timeout = 5000 }: ObserverOptions = {}) {
    observeUntil(selector, (elements) => {
        elements.forEach(el => {
            el.style.display = 'none';
        });
    }, { timeout, once });
}

function isVisible<T extends Element>(el: T | null): el is T {
    return !!(el?.isConnected && el.getClientRects().length &&
        !el.closest('[hidden], [inert], [aria-hidden="true"]') && getComputedStyle(el).visibility === 'visible');
}

function isClickable<T extends Element>(el: T | null): el is T {
    return isVisible(el) && !el.matches(':disabled, .disabled, [aria-disabled="true"]');
}

function getClickDelay(delay: ClickDelay) {
    return Array.isArray(delay)
        ? Math.floor(Math.random() * (delay[1] - delay[0] + 1)) + delay[0]
        : delay;
}

export function closeTargetWhenTriggerAvailableInsideContainer(containerSelector: string,
    { triggerSelector, targetSelector = '.closable', once = true, timeout = 5000, delay = 0 }: PopupOptions = {}) {
    let container: Element | null = null;
    let activePopup: Element | null = null;
    let clicked = false;
    let pending: number | null = null;
    let expiry: number | undefined;

    const getActivePopup = () => {
        const popup = document.querySelector(containerSelector);
        if (!isVisible(popup)) return null;
        if (triggerSelector && !Array.from(popup.querySelectorAll(triggerSelector)).some(element => isVisible(element))) return null;
        return popup;
    };

    const getTarget = (popup: Element) => {
        const targets = Array.from(popup.querySelectorAll<HTMLElement>(targetSelector)).filter(element => isClickable(element));
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
        if (current !== container || (current && mutations.some(({ target }) => current.contains(target) || target.contains(current)))) check();
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden', 'inert', 'aria-hidden', 'disabled', 'aria-disabled']
    });
    if (timeout !== null && Number.isFinite(timeout) && timeout > 0) expiry = setTimeout(() => observer.disconnect(), timeout);
    check();
}

export function removeClassWhenSelectorAvailable(selector: string, classToRemove: string,
    { once = true, timeout = 5000 }: ObserverOptions = {}) {
    observeUntil(selector, (elements) => {
        elements.forEach(el => el.classList.remove(classToRemove));
    }, { timeout, once });
}

export function clickWhenSelectorAvailable(selector: string, elementToClick: string,
    { delay = 2000, once = true, timeout = 5000 }: ClickOptions = {}) {
    let pending = false;
    let hasClicked = false;

    observeUntil(selector, () => {
        if (hasClicked || pending) return;

        const closeElement = document.querySelector<HTMLElement>(elementToClick);
        if (isClickable(closeElement)) {
            pending = true;
            setTimeout(() => {
                pending = false;
                    if (isClickable(closeElement) && Array.from(document.querySelectorAll(selector)).some(element => isVisible(element))) {
                    hasClicked = true;
                    closeElement.click();
                }
            }, getClickDelay(delay));
        }
    }, { timeout, once });
}

export function spacebarToClick(selectors: { selector: string; triggerSelector?: string }[]) {
    document.addEventListener('keydown', (e) => {
        if (e.key !== ' ' && e.code !== 'Space') return;
        if (e.defaultPrevented || e.repeat || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        if (e.target instanceof Element &&
            e.target.closest('input, textarea, select, button, a[href], [role="button"], [contenteditable]:not([contenteditable="false"])')) return;

        for (const { selector, triggerSelector } of selectors) {
            if (triggerSelector && !Array.from(document.querySelectorAll(triggerSelector)).some(element => isVisible(element))) continue;
            const targets = Array.from(document.querySelectorAll(selector)).filter(element => isClickable(element));
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
