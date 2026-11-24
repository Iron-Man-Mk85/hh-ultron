export let $: JQueryStatic;
export let currentPage: string;
export const rewardButton = 'button.blue_button_L[confirm_blue_button]';

export function initGame(jQuery: JQueryStatic) {
    $ = jQuery;
    currentPage = window.location.pathname;
}
