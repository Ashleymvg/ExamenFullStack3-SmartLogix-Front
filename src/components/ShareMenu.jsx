import { useEffect, useRef, useState } from "react";

/**
 * Botón "Compartir" con menú desplegable: WhatsApp, Facebook, X (Twitter),
 * Instagram (copia el enlace, ya que Instagram no permite compartir por URL
 * desde la web) y "Copiar enlace". Si el navegador soporta la Web Share API
 * (típicamente en celulares), también ofrece el panel nativo del sistema.
 *
 * No depende de librerías externas: los íconos son SVG inline.
 */
function ShareMenu({ label = "🔗 Compartir", align = "left" }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const wrapperRef = useRef(null);

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = "Mira SmartLogix:";

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert("No se pudo copiar el enlace: " + err.message);
        }
    }

    async function handleNativeShare() {
        try {
            await navigator.share({ title: "SmartLogix", text: shareText, url: shareUrl });
            setOpen(false);
        } catch (err) {
            // El usuario cancela el panel nativo -> no hacemos nada
        }
    }

    function openShareWindow(url) {
        window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
        setOpen(false);
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const options = [
        {
            name: "WhatsApp",
            color: "#25D366",
            icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />,
            action: () => openShareWindow(`https://wa.me/?text=${encodedText}%20${encodedUrl}`),
        },
        {
            name: "Facebook",
            color: "#1877F2",
            icon: <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.459h-1.26c-1.243 0-1.63.771-1.63 1.562v1.877h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />,
            action: () => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
        },
        {
            name: "X (Twitter)",
            color: "#000000",
            icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />,
            action: () => openShareWindow(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`),
        },
        {
            name: "Instagram",
            color: "#E1306C",
            icon: <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.256 1.216.6 1.772 1.153.554.554.9 1.113 1.153 1.772.247.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.01 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.065.217-1.791.465-2.428a4.89 4.89 0 011.153-1.772A4.904 4.904 0 015.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.01 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.25a3.25 3.25 0 110-6.5 3.25 3.25 0 010 6.5zm5.25-9.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />,
            action: () => {
                handleCopyLink();
                alert("Enlace copiado. Instagram no permite compartir un link directo desde la web: pégalo en tu historia o mensaje.");
            },
        },
    ];

    return (
        <div ref={wrapperRef} style={{ position: "relative", display: "inline-block" }}>
            <button
                onClick={() => setOpen((v) => !v)}
                style={{
                    background: "#6f42c1",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                }}
            >
                {label}
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        [align]: 0,
                        background: "#2d1b4e",
                        border: "1px solid rgba(192, 132, 252, 0.35)",
                        borderRadius: "10px",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                        padding: "10px",
                        minWidth: "200px",
                        zIndex: 1000,
                    }}
                >
                    {typeof navigator !== "undefined" && navigator.share && (
                        <button
                            onClick={handleNativeShare}
                            style={{
                                display: "flex", alignItems: "center", gap: "10px", width: "100%",
                                background: "transparent", border: "none", color: "#fff",
                                padding: "8px 6px", borderRadius: "6px", cursor: "pointer", fontSize: "14px",
                                textAlign: "left",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            📤 Compartir con el sistema…
                        </button>
                    )}

                    {options.map((opt) => (
                        <button
                            key={opt.name}
                            onClick={opt.action}
                            style={{
                                display: "flex", alignItems: "center", gap: "10px", width: "100%",
                                background: "transparent", border: "none", color: "#fff",
                                padding: "8px 6px", borderRadius: "6px", cursor: "pointer", fontSize: "14px",
                                textAlign: "left",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill={opt.color}>
                                {opt.icon}
                            </svg>
                            {opt.name}
                        </button>
                    ))}

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "6px 0" }} />

                    <button
                        onClick={handleCopyLink}
                        style={{
                            display: "flex", alignItems: "center", gap: "10px", width: "100%",
                            background: "transparent", border: "none", color: "#d8b4fe",
                            padding: "8px 6px", borderRadius: "6px", cursor: "pointer", fontSize: "14px",
                            textAlign: "left",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        {copied ? "✅ ¡Enlace copiado!" : "📋 Copiar enlace"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ShareMenu;
