export default function ConfirmRunModal({
    isOpen,
    onClose,
    onConfirm,
    process,
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Please Confirm</h2>
                <p>Are you sure you want to {process}?</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm} className="confirm-run">
                        Yes
                    </button>
                    <button onClick={onClose} className="cancel-button">
                        No
                    </button>
                </div>
            </div>
        </div>
    );
}
