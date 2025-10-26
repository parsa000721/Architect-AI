
import React, { useState, useMemo } from 'react';
import { Material, OtherCost } from '../types';
import { TrashIcon, PlusIcon } from './icons/IconComponents';

const initialMaterials: Material[] = [
    { name: 'ईंटें', unit: 'पीस', rate: 8, quantity: 20000 },
    { name: 'सीमेंट', unit: 'बैग', rate: 350, quantity: 800 },
    { name: 'रेत', unit: 'घन फीट', rate: 45, quantity: 2500 },
    { name: 'स्टील', unit: 'किग्रा', rate: 65, quantity: 5000 },
];

const initialOtherCosts: OtherCost[] = [
    { name: 'श्रमिक लागत', amount: 500000 },
    { name: 'परमिट शुल्क', amount: 75000 },
];

export const BudgetCalculator: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);
    const [otherCosts, setOtherCosts] = useState<OtherCost[]>(initialOtherCosts);

    const handleMaterialChange = <K extends keyof Material, >(index: number, field: K, value: Material[K]) => {
        const newMaterials = [...materials];
        newMaterials[index][field] = value;
        setMaterials(newMaterials);
    };
    
    const handleOtherCostChange = <K extends keyof OtherCost,>(index: number, field: K, value: OtherCost[K]) => {
        const newCosts = [...otherCosts];
        newCosts[index][field] = value;
        setOtherCosts(newCosts);
    };

    const totalMaterialCost = useMemo(() => materials.reduce((acc, item) => acc + item.rate * item.quantity, 0), [materials]);
    const totalOtherCost = useMemo(() => otherCosts.reduce((acc, item) => acc + item.amount, 0), [otherCosts]);
    const grandTotal = totalMaterialCost + totalOtherCost;

    return (
        <div className="max-w-5xl mx-auto">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">बजट कैलकुलेटर</h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">सामग्री, श्रम और अन्य शुल्कों के आधार पर अपने प्रोजेक्ट के बजट की गणना करें।</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-4">सामग्री लागत</h4>
                    <div className="space-y-4">
                        {materials.map((mat, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                                <input value={mat.name} onChange={(e) => handleMaterialChange(index, 'name', e.target.value)} className="col-span-1 sm:col-span-2 w-full p-2 bg-white dark:bg-secondary-900 border-secondary-300 dark:border-secondary-600 rounded-md text-sm" placeholder="सामग्री"/>
                                <input type="number" value={mat.quantity} onChange={(e) => handleMaterialChange(index, 'quantity', Number(e.target.value))} className="w-full p-2 bg-white dark:bg-secondary-900 border-secondary-300 dark:border-secondary-600 rounded-md text-sm" placeholder="मात्रा"/>
                                <input type="number" value={mat.rate} onChange={(e) => handleMaterialChange(index, 'rate', Number(e.target.value))} className="w-full p-2 bg-white dark:bg-secondary-900 border-secondary-300 dark:border-secondary-600 rounded-md text-sm" placeholder="दर"/>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-4">अन्य लागतें</h4>
                     <div className="space-y-4">
                        {otherCosts.map((cost, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
                                <input value={cost.name} onChange={(e) => handleOtherCostChange(index, 'name', e.target.value)} className="w-full p-2 bg-white dark:bg-secondary-900 border-secondary-300 dark:border-secondary-600 rounded-md text-sm" placeholder="विवरण"/>
                                <input type="number" value={cost.amount} onChange={(e) => handleOtherCostChange(index, 'amount', Number(e.target.value))} className="w-full p-2 bg-white dark:bg-secondary-900 border-secondary-300 dark:border-secondary-600 rounded-md text-sm" placeholder="राशि"/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
                <div className="bg-primary-50 dark:bg-primary-900/50 p-6 rounded-lg text-center">
                    <h4 className="text-lg font-medium text-secondary-500 dark:text-secondary-400">अनुमानित कुल बजट</h4>
                    <p className="text-4xl font-bold text-primary-600 dark:text-primary-300 mt-2">
                        {new Intl.NumberFormat('hi-IN', { style: 'currency', currency: 'INR' }).format(grandTotal)}
                    </p>
                </div>
            </div>
        </div>
    );
};
