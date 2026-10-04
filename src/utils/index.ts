


export function createPageUrl(pageName: string) {
    // 'Home' is a legacy alias of the canonical homepage at '/'.
    if (pageName.toLowerCase() === 'home') {
        const qIndex = pageName.indexOf('?');
        return qIndex === -1 ? '/' : '/' + pageName.slice(qIndex);
    }
    if (pageName.includes('?')) {
        const [path, search] = pageName.split('?');
        return '/' + path + '?' + search;
    }
    return '/' + pageName;
}

export function getLocalizedValue(obj: any, key: string, language: string, fallbackToDefault = true) {
    if (!obj) return '';
    const isRTL = language === 'ar';
    const val = isRTL ? obj[`${key}_ar`] : obj[key];
    if (val) return val;
    return fallbackToDefault ? obj[key] : '';
}

export function cleanMapUrl(url: string) {
    if (!url) return '';
    // If the URL is an iframe tag, extract the src
    const srcMatch = url.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
    }
    // If it's already a URL, return it as is
    return url;
}