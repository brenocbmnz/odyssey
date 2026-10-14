import { Link } from "@tanstack/react-router";
import { useLanguage } from "../i18n/LanguageContext";
export function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="empty">
      <h1>{t("Página não encontrada")}</h1>
      <Link to="/">{t("Voltar ao início")}</Link>
    </div>
  );
}
export function RouteError() {
  const { t } = useLanguage();
  return (
    <div className="empty" role="alert">
      <h1>{t("Algo deu errado")}</h1>
      <a href="/">{t("Recarregar aplicação")}</a>
    </div>
  );
}
export function StartupError() {
  const { t } = useLanguage();
  return (
    <main className="empty" role="alert">
      <h1>{t("Não foi possível iniciar o Odyssey")}</h1>
      <p>
        {t(
          "A API demonstrativa precisa de um navegador com Service Worker e de HTTPS ou localhost.",
        )}
      </p>
      <button onClick={() => location.reload()}>{t("Tentar novamente")}</button>
    </main>
  );
}
