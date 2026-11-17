import site from "../config/site.json";

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        このデータは{" "}
        <a href={site.license.url} target="_blank" rel="noreferrer">
          {site.license.name}
        </a>{" "}
        のもとで公開されています。{site.license.attribution}
      </p>
      <p>
        出典：{site.title} ／ データの取得：<a href="/api/entries">JSON</a>・<a href="/api/entries?format=csv">CSV</a>
      </p>
    </footer>
  );
}
