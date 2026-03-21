import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Activity, Trophy, Zap, TrendingUp, Target } from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

import { syncProductivity, getWeeklyTrend, getHeatmap } from "../api";
import "./Dashboard.css";

const COLORS = ["#FF3B30", "#FF9500", "#34C759", "#007AFF"]; // Apple System Colors

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08, delayChildren: 0.2 } 
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 100 } 
  }
};

export default function Dashboard() {
  const [score, setScore] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const result = await syncProductivity();
      if (!result) return;

      setScore(result.productivity_score || 0);
      const weekly = await getWeeklyTrend();
      if (weekly?.length > 0) {
        setWeeklyData(weekly.map(item => ({
          name: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
          score: item.score
        })));
      }

      const heatmap = await getHeatmap();
      setHeatmapData(heatmap || []);
      setPieData([
        { name: "GitHub", value: result.github_commits || 0 },
        { name: "LeetCode", value: result.leetcode_solved || 0 },
        { name: "Tasks", value: result.notion_tasks_completed || 0 },
        { name: "Calendar", value: result.calendar_events || 0 }
      ]);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPerformance(); }, []);

  return (
    <div className="dashboard-container">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="loader-overlay"
          >
            <div className="apple-spinner"></div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="dashboard-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.header className="dashboard-header" variants={itemVariants}>
              <p className="date-pill">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
              <h1>Performance <span className="sf-light">Overview</span></h1>
            </motion.header>

            <div className="stats-grid">
              <StatCard icon={<Activity />} label="Productivity" value={score} color="red" />
              <StatCard icon={<Trophy />} label="Commits" value={pieData[0]?.value} color="gold" />
              <StatCard icon={<Zap />} label="Solved" value={pieData[1]?.value} color="blue" />
            </div>

            <motion.div className="chart-card heatmap-card" variants={itemVariants}>
              <div className="card-header">
                <h3><Activity size={18} /> Activity Intensity</h3>
              </div>
              <CalendarHeatmap
                startDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
                endDate={new Date()}
                values={heatmapData}
                classForValue={(v) => `color-apple-${v?.count || 0 > 4 ? 4 : v?.count || 0}`}
              />
            </motion.div>

            <div className="charts-grid">
              <motion.div className="chart-card" variants={itemVariants}>
                <h3><TrendingUp size={18}/> Weekly Trend</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="score" stroke="#FF3B30" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div className="chart-card" variants={itemVariants}>
                <h3><Target size={18}/> Activity Split</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} innerRadius={70} outerRadius={90} dataKey="value" paddingAngle={5}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={10} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div className="stat-card" variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}>
      <div className={`icon-wrapper ${color}`}>{icon}</div>
      <div className="stat-text">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value || 0}</span>
      </div>
    </motion.div>
  );
}