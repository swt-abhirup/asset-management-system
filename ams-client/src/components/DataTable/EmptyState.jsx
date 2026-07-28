export default function EmptyState({
    title   = "No Records Found",
    message = "Nothing to display yet.",
    buttonText,
    onButtonClick
}) {

    return (

        <div className="flex flex-col items-center justify-center py-14">

            <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: "rgba(25,64,94,0.07)" }}
            >
                <span className="text-2xl">📋</span>
            </div>

            <h3
                className="text-sm font-semibold mb-1"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: "#19405e" }}
            >
                {title}
            </h3>

            <p className="text-xs" style={{ color: "#94a3b8" }}>
                {message}
            </p>

            {buttonText && (
                <button
                    onClick={onButtonClick}
                    className="mt-4 px-4 py-2 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: "#19405e" }}
                >
                    {buttonText}
                </button>
            )}

        </div>

    );

}
