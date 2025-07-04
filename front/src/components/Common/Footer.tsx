const Footer = () => {
  return (
    <footer
      style={{
        width: "100%",
        background: "#f7f9fb",
        color: "#888",
        fontSize: "1rem",
        textAlign: "center",
        padding: "28px 0 18px 0",
        marginTop: 48,
        borderTop: "1px solid #e0e0e0",
      }}
    >
      © 2024 StocKommon Inc. |{" "}
      <a
        href="https://github.com/"
        style={{ color: "#2563eb", textDecoration: "none" }}
      >
        GitHub
      </a>
    </footer>
  );
};

export default Footer;
