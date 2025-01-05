import $ from 'jquery';

chrome.runtime.sendMessage({ action: "getEnabledState" }, (response) => {
    if (response.enabled) {
        $(ready);
    }
});

function ready() {
    const timeout = 500;
    console.log(`[Custom Controls] Waiting ${timeout} ms before init`);
    setTimeout(init, timeout);
}

function init() {
    const video = $("video#my-player_html5_api");
    const videoWrapperEl = video.parents('.post_media');
    
    if (video.length == 0) {
        console.log("[Custom Controls] Video element not found");
        return;
    }
    
    const newControls = $(`
        <div class="custom-controls">
            <label class="label" for="speed-slider">Скорость</label>
            <input type="range" min="0.5" max="4" value="1" class="slider" step="0.1" id="speed-slider">
            <span class="speed-indicator" id="speed-indicator">x1</span>
            
            <label class="label checkbox-label grid-row-2" for="skip-opening-checkbox">Пропускать опенинг</label>
            <input type="checkbox" id="skip-opening-checkbox">
            
            <label class="label checkbox-label grid-row-3" for="autoplay-checkbox">Автопилот</label>
            <input type="checkbox" id="autoplay-checkbox">
        </div>
    `);
    
    videoWrapperEl.after(newControls);

    const speedSlider = $("#speed-slider");
    const skipOpeningCheckbox = $("#skip-opening-checkbox");
    const autoplayCheckbox = $("#autoplay-checkbox");
    const speedIndicator = $("#speed-indicator");
    const skipOpeningLabel = $("label[for='skip-opening-checkbox']");
    const autoplayLabel = $("label[for='autoplay-checkbox']");
    const skipOpeningButton = video.parent().find(".vjs-overlay-bottom-left.vjs-overlay-skip-intro");
    const nextEpisodeButton = video.parent().find(".vjs-overlay-bottom-right");
    
    const skipOpeningObserver = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (!$(mutation.target).hasClass('vjs-hidden')) {
                $(mutation.target).click();
            }
        }
    });
    
    const nextEpisodeObserver = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (!$(mutation.target).hasClass('vjs-hidden')) {
                $(mutation.target).click();
            }
        }
    });
    
    loadSettings();
    
    speedSlider.on("input", event => setSpeed(+event.target.value));
    skipOpeningCheckbox.on("change", event => setSkipOpening(!!event.target.checked));
    autoplayCheckbox.on("change", event => setAutoplay(!!event.target.checked));
    
    if (!!autoplayCheckbox.prop('checked')) {
        video.get(0).scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        video.get(0).play();
    }
    
    function setSpeed(speed) {
        video.get(0).playbackRate = speed;
        speedIndicator.text("x" + speed);
        saveSettings();
    }
    
    function setSkipOpening(value) {
        if (value) {
            skipOpeningLabel.addClass('active');
            skipOpeningObserver.observe(skipOpeningButton.get(0), {
                attributes: true,
                attributeFilter: ['class']
            });
        } else {
            skipOpeningLabel.removeClass('active');
            skipOpeningObserver.disconnect();
        }
        saveSettings();
    }
    
    function setAutoplay(value) {
        if (value) {
            autoplayLabel.addClass('active');
            nextEpisodeObserver.observe(nextEpisodeButton.get(0), {
                attributes: true,
                attributeFilter: ['class']
            });
        } else {
            autoplayLabel.removeClass('active');
            nextEpisodeObserver.disconnect();
        }
        saveSettings();
    }
    
    function saveSettings() {
        localStorage.setItem("custom_controls__speed", +speedSlider.val());
        localStorage.setItem("custom_controls__skip_opening", !!skipOpeningCheckbox.prop('checked'));
        localStorage.setItem("custom_controls__autoplay", !!autoplayCheckbox.prop('checked'));
    }
    
    function loadSettings() {
        const speed = +localStorage.getItem("custom_controls__speed");
        const skipOpening = localStorage.getItem("custom_controls__skip_opening") === "true";
        const autoplay = localStorage.getItem("custom_controls__autoplay") === "true";
        
        if (speed !== null) {
            speedSlider.val(speed);
            setSpeed(speed);
        }
        if (skipOpening !== null) {
            skipOpeningCheckbox.prop("checked", skipOpening);
            setSkipOpening(skipOpening);
        }
        if (autoplay !== null) {
            autoplayCheckbox.prop("checked", autoplay);
            setAutoplay(autoplay);
        }
    }
}

