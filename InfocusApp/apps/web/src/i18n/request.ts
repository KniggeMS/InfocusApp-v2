export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    const messages = {
        de: () => import("../messages/de.json").then((module) => module.default),
        en: () => import("../messages/en.json").then((module) => module.default),
    };

    return {
        locale,
        messages: await messages[locale as keyof typeof messages]()
    };
});
