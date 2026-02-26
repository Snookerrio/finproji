import React from 'react';
import type {IOrder} from "../../interfaces/order.interface.ts";
import type {IComment} from "../../interfaces/comment.interface.ts";

interface OrderRowProps {
    order: IOrder;
    idx: number | string;
    filtersPage: number;
    currentUserSurname: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onCommentSubmit: (order: IOrder, text: string) => void;
    onEdit: (order: IOrder) => void;
    commentText: string;
    setCommentText: (text: string) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({
                                               order,
                                               idx,
                                               currentUserSurname,
                                               isExpanded,
                                               onToggleExpand,
                                               onCommentSubmit,
                                               onEdit,
                                               commentText,
                                               setCommentText
                                           }) => {


    const isLocked = !!(order.manager && order.manager !== currentUserSurname && order.manager !== "null");

    return (
        <React.Fragment>
            <tr
                onClick={onToggleExpand}
                className={`hover:bg-green-50 border-b cursor-pointer transition ${isExpanded ? 'bg-green-100/30' : ''}`}
            >

                <td className="p-2 border text-[11px] font-bold text-gray-600 text-center">
                    {idx}
                </td>

                <td className="p-2 border font-bold text-[11px]">{order.name || 'null'}</td>
                <td className="p-2 border font-bold text-[11px]">{order.surname || 'null'}</td>
                <td className="p-2 border italic text-blue-600 text-[11px]">{order.email || 'null'}</td>
                <td className="p-2 border text-[11px]">{order.phone || 'null'}</td>


                <td className="p-2 border text-center text-[11px]">
                    {order.age && !isNaN(Number(order.age)) ? Math.abs(Number(order.age)) : '—'}
                </td>

                <td className="p-2 border font-bold text-[11px]">{order.course || 'null'}</td>
                <td className="p-2 border text-center text-[11px]">{order.course_format || 'null'}</td>
                <td className="p-2 border text-center italic text-[11px]">{order.course_type || 'null'}</td>
                <td className="p-2 border text-center font-black uppercase text-blue-700 text-[11px]">{order.status || 'null'}</td>
                <td className="p-2 border text-center font-bold text-green-700 text-[11px]">{order.sum ?? 'null'}</td>
                <td className="p-2 border text-center font-bold text-[11px]">{order.alreadyPaid ?? 'null'}</td>
                <td className="p-2 border text-center italic text-[11px]">{order.group || 'null'}</td>


                <td className="p-2 border text-[11px]">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : (order.created_at ? new Date(order.created_at).toLocaleDateString() : 'null')}
                </td>

                <td className="p-2 border text-center font-medium uppercase italic text-green-800 text-[11px]">{order.manager || 'null'}</td>
            </tr>


            {isExpanded && (
                <tr className="bg-gray-50 border-b-2 border-green-200">
                    <td colSpan={15} className="p-6">
                        <div className="flex gap-8 items-start">
                            {/* Повідомлення та UTM */}
                            <div className="w-1/4 flex flex-col gap-3">
                                <div className="bg-white p-5 border-2 border-red-400 rounded-2xl shadow-sm min-h-[110px]">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Message:</h4>
                                    <p className="text-gray-700 italic text-sm">
                                        "{ order.msg || 'No message provided' }"
                                    </p>
                                </div>
                                <div className="bg-white p-3 border-2 border-gray-100 rounded-xl text-[10px] text-gray-400 uppercase">
                                    utm: { order.utm || 'none' }
                                </div>
                            </div>


                            <div className="flex-1 min-w-[300px]">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-2">Comments History:</h4>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {order.comments && order.comments.length > 0 ? (
                                        order.comments.map((c: IComment, i: number) => (
                                            <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                                <p className="text-xs text-gray-800">{c.text}</p>
                                                <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                                                    <span className="text-green-600">{c.author}</span>
                                                    <span>{new Date(c.date).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                                            <p className="text-gray-400 italic text-xs">No comments yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="w-1/3 flex gap-3">
                                <textarea
                                    placeholder={isLocked ? "Locked by another manager" : "Enter comment..."}
                                    className="flex-1 border-2 border-gray-200 p-4 rounded-2xl text-xs outline-none bg-white h-32 resize-none focus:border-green-400 transition"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={isLocked}
                                />
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onCommentSubmit(order, commentText)}
                                        disabled={isLocked || !commentText.trim()}
                                        className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase text-white transition shadow-md active:scale-95 ${
                                            isLocked || !commentText.trim() ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    >
                                        Submit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(order)}
                                        disabled={isLocked}
                                        className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase text-white transition shadow-md active:scale-95 ${
                                            isLocked ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

export default OrderRow;