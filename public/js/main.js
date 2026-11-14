function retryImage(img) {
    const tries = Number(img.dataset.tries || 0);

    if (tries >= 3) return;

    img.dataset.tries = tries + 1;

    const baseSrc = img.src.split("?")[0];

    setTimeout(() => {
        img.src = baseSrc + "?retry=" + Date.now();
    }, 1000 * (tries + 1));
}