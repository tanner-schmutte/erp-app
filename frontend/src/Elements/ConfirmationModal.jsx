export default function ConfirmationModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Confirm Delete</h2>
                <p>Are you sure you want to delete this user?</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm} className="confirm-button">
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
