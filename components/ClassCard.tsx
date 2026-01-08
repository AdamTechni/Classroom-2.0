"use client";

interface ClassCardProps {
    name: string;
    description: string;
    memberCount: number;
    color?: string;
}

export function ClassCard({ name, description, memberCount, color = "blue" }: ClassCardProps) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600",
        purple: "from-purple-500 to-purple-600",
        green: "from-green-500 to-green-600",
        orange: "from-orange-500 to-orange-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:scale-105 cursor-pointer">
            <div className={`h-24 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} p-6 flex items-center`}>
                <h3 className="text-2xl font-bold text-white">{name}</h3>
            </div>
            <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
                <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    {memberCount} members
                </div>
            </div>
        </div>
    );
}
