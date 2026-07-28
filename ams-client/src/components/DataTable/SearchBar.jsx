import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search…" }) {

    return (

        <div className="relative">
            <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
                style={{ color: "#94a3b8" }}
            />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="pl-8 pr-3 py-2 text-xs rounded border outline-none w-56"
                style={{ borderColor: "#e2e8f0", color: "#1e293b" }}
                onFocus={e => {
                    e.target.style.borderColor = "#19405e";
                    e.target.style.boxShadow   = "0 0 0 2px rgba(25,64,94,0.1)";
                }}
                onBlur={e => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow   = "none";
                }}
            />
        </div>

    );

}
