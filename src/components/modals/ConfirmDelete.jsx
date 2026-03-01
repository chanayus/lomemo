import { useModal } from "../../providers/ModalProvider";

const ConfirmDelete = ({ onConfirm = () => {} }) => {
  const { closeModal } = useModal();
  return (
    <div className="p-6 space-y-4 border w-full max-w-md border-white/20 rounded-xl bg-black/75">
      <h2 className="font-bold text-lg">ลบรายการโปรด</h2>
      <p>ยืนยันที่จะลบออกจากรายการโปรด ?</p>
      <div className="flex items-center gap-x-2">
        <button onClick={() => closeModal()} className="flex-1 bg-white/20 text-white py-2 rounded-xl font-bold hover:bg-white/10 transition-colors disabled:opacity-50">
          ยกเลิก
        </button>
        <button
          onClick={() => {
            onConfirm();
            closeModal();
          }}
          className="flex-1 bg-red-700 text-white py-2 rounded-xl font-bold hover:bg-red-900 transition-colors disabled:opacity-50"
        >
          ลบ
        </button>
      </div>
    </div>
  );
};

export default ConfirmDelete;
