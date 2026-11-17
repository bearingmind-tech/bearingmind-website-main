import styles from "./SearchForm.module.css";

/* Plain HTML form: works without JavaScript, and the query is only ever shown as text. */
export function SearchForm({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form className={styles.form} action="/search" method="get" role="search">
      <label htmlFor="site-search" className="sr-only">
        Search the website
      </label>
      <input
        id="site-search"
        className={styles.input}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search sessions, questions, approach…"
        maxLength={80}
        autoComplete="off"
        autoFocus={autoFocus}
      />
      <button className={`btn ${styles.btn}`} type="submit">
        Search
      </button>
    </form>
  );
}
