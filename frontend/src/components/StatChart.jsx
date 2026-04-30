import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const StatChart = ({ data }) => {
  return (
    <>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="applicants" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default StatChart;