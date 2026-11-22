export function settingHelp(label: string, description: string) {
    const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    return escape(label) + ' <span class="ironman-setting-help" role="button" tabindex="0" aria-label="About ' +
        escape(label) + '" data-setting-help="' + escape(description) + '">?</span>';
}

export function mountSettingsHelp(panel: HTMLElement, tooltipId: string) {
    const tooltip = document.createElement('div');
    tooltip.id = tooltipId;
    tooltip.className = 'ironman-setting-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    const popover = typeof tooltip.showPopover === 'function';
    if (popover) tooltip.setAttribute('popover', 'manual');
    else tooltip.hidden = true;
    document.body.appendChild(tooltip);

    let anchor: HTMLElement | null = null;
    const getHelp = (target: EventTarget | null) =>
        target instanceof Element ? target.closest<HTMLElement>('[data-setting-help]') : null;
    const close = () => {
        if (!anchor) return;
        anchor.removeAttribute('aria-describedby');
        anchor = null;
        if (popover) tooltip.hidePopover();
        else tooltip.hidden = true;
    };
    const show = (help: HTMLElement) => {
        if (anchor === help) return;
        close();
        anchor = help;
        help.setAttribute('aria-describedby', tooltipId);
        tooltip.textContent = help.dataset.settingHelp ?? '';
        if (popover) tooltip.showPopover();
        else tooltip.hidden = false;

        const bounds = help.getBoundingClientRect();
        const { offsetWidth, offsetHeight } = tooltip;
        tooltip.style.left = Math.max(8, Math.min(bounds.left, document.documentElement.clientWidth - offsetWidth - 8)) + 'px';
        const below = bounds.bottom + 6;
        tooltip.style.top = (below + offsetHeight <= window.innerHeight - 8
            ? below : Math.max(8, bounds.top - offsetHeight - 6)) + 'px';
    };

    panel.addEventListener('pointerover', event => {
        const help = getHelp(event.target);
        if (help && event.pointerType !== 'touch') show(help);
    });
    panel.addEventListener('pointerout', event => {
        const help = getHelp(event.target);
        if (help === anchor && help && document.activeElement !== help) close();
    });
    panel.addEventListener('focusin', event => {
        const help = getHelp(event.target);
        if (help) show(help);
    });
    panel.addEventListener('focusout', event => {
        if (getHelp(event.target) === anchor) close();
    });
    panel.addEventListener('click', event => {
        const help = getHelp(event.target);
        if (!help) return;
        event.preventDefault();
        event.stopPropagation();
        show(help);
    });
    panel.addEventListener('keydown', event => {
        const help = getHelp(event.target);
        if (help && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            event.stopPropagation();
            show(help);
        } else if (anchor && event.key === 'Escape') {
            event.stopPropagation();
            close();
        }
    });
    document.addEventListener('pointerdown', event => {
        if (getHelp(event.target) !== anchor) close();
    });
    panel.addEventListener('scroll', close, { capture: true, passive: true });
}
