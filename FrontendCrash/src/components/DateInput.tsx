import { useEffect, useState } from "react";

// Input de data no formato brasileiro dd/mm/aaaa
// value/onChange usam YYYY-MM-DD internamente (compatível com a API)
// Guarda o texto digitado em estado local para a máscara funcionar com React

interface DateInputProps {
    value: string;                  // YYYY-MM-DD (ou "")
    onChange: (v: string) => void;  // devolve YYYY-MM-DD (ou "" se incompleto)
    required?: boolean;
    className?: string;
}

function isoToDisplay(iso: string): string {
    if (!iso || iso.length < 10) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function applyMask(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function displayToISO(display: string): string {
    const digits = display.replace(/\D/g, "");
    if (digits.length < 8) return "";
    return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function DateInput({ value, onChange, required, className }: DateInputProps) {
    // Estado local para o texto que o usuário vê enquanto digita
    const [display, setDisplay] = useState(() => isoToDisplay(value));

    // Sincroniza quando o pai altera value externamente (ex: limpar formulário)
    useEffect(() => {
        setDisplay(isoToDisplay(value));
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const masked = applyMask(e.target.value);
        setDisplay(masked);
        onChange(displayToISO(masked)); // devolve ISO só quando completo
    }

    return (
        <input
            className={className ?? "form-input"}
            type="text"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
            required={required}
            value={display}
            onChange={handleChange}
            maxLength={10}
        />
    );
}

export default DateInput;
