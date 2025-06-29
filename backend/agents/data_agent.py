"""
Data Analysis Agent for processing and analyzing data
"""

import pandas as pd
from io import StringIO
import re
from typing import Dict, Any
import os

class DataAgent:
    def __init__(self):
        self.name = "Data Agent"
        self.description = "Analyzes data, processes CSV files, and provides data insights"
    
    async def run_tool(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process data analysis requests"""
        try:
            message = input_data.get("message", "").lower()
            
            # Check if CSV data is provided
            csv_data = input_data.get("csv_data")
            if csv_data:
                result = self.analyze_csv_data(csv_data, message)
                return {
                    "content": result,
                    "type": "data_analysis",
                    "source": "DataAgent"
                }
            
            # Data analysis help
            elif any(keyword in message for keyword in ["analyze data", "data analysis", "csv", "dataset"]):
                return {
                    "content": """I'm your Data Analysis Assistant! I can help you with:

• CSV data analysis - Upload or paste CSV data
• Statistical summaries - Mean, median, standard deviation
• Data exploration - Column info, missing values, unique counts
• Correlations - Relationships between variables
• Grouping operations - Group by columns and aggregate
• Data visualization insights

To get started:
1. Provide CSV data (paste or upload)
2. Ask specific questions like:
   - "Show me the first 10 rows"
   - "Calculate summary statistics"
   - "Find missing values"
   - "Group by category and show averages"

What data would you like me to analyze?""",
                    "type": "help",
                    "source": "DataAgent"
                }
            
            # Status check
            elif any(keyword in message for keyword in ["data status", "analysis capabilities"]):
                result = self.get_data_analysis_status()
                return {
                    "content": result,
                    "type": "status_check",
                    "source": "DataAgent"
                }
            
            # General help
            else:
                return {
                    "content": """I can help you analyze data! Please provide:

• CSV data to analyze
• Specific questions about your data
• Analysis requirements

Example: "Analyze this sales data and show me monthly trends"

What data analysis do you need help with?""",
                    "type": "help",
                    "source": "DataAgent"
                }
                
        except Exception as e:
            return {
                "content": f"I encountered an error with your data analysis request: {str(e)}",
                "type": "error",
                "source": "DataAgent"
            }
    
    def analyze_csv_data(self, csv_content: str, query: str) -> str:
        """Analyze CSV data based on user query"""
        try:
            # Read CSV data
            df = pd.read_csv(StringIO(csv_content), encoding='utf-8', na_values=['NA', 'N/A', 'missing'])
            
            query_lower = query.lower()
            
            # Show first rows
            if any(word in query_lower for word in ['first', 'rows', 'head', 'show']):
                num_rows = 5
                numbers = re.findall(r'\d+', query)
                if numbers:
                    num_rows = min(int(numbers[0]), len(df))
                
                return f"""**First {num_rows} rows of data:**

{df.head(num_rows).to_string()}

**Dataset Info:**
• Shape: {df.shape[0]} rows × {df.shape[1]} columns
• Columns: {list(df.columns)}"""
            
            # Column information
            elif any(word in query_lower for word in ['columns', 'column names', 'data types']):
                col_info = []
                for col in df.columns:
                    dtype = str(df[col].dtype)
                    null_count = df[col].isnull().sum()
                    col_info.append(f"• **{col}**: {dtype} ({null_count} null values)")
                
                return f"""**Column Information:**

**Total Columns**: {len(df.columns)}
**Dataset Shape**: {df.shape[0]} rows × {df.shape[1]} columns

**Column Details:**
{chr(10).join(col_info)}"""
            
            # Summary statistics
            elif any(word in query_lower for word in ['summary', 'statistics', 'describe', 'mean', 'median']):
                numeric_cols = df.select_dtypes(include=['number']).columns
                if len(numeric_cols) > 0:
                    summary = df[numeric_cols].describe()
                    return f"""**Summary Statistics:**

**Numeric Columns**: {list(numeric_cols)}

{summary.to_string()}"""
                else:
                    return "No numeric columns found for statistical analysis."
            
            # Missing values
            elif any(word in query_lower for word in ['missing', 'null', 'na']):
                missing_data = df.isnull().sum()
                missing_percent = (missing_data / len(df)) * 100
                
                missing_info = []
                for col, count in missing_data.items():
                    if count > 0:
                        missing_info.append(f"• **{col}**: {count} ({missing_percent[col]:.1f}%)")
                
                if missing_info:
                    return f"""**Missing Values Analysis:**

{chr(10).join(missing_info)}

**Total Missing Values**: {missing_data.sum()}"""
                else:
                    return "✅ No missing values found in the dataset!"
            
            # Correlations
            elif any(word in query_lower for word in ['correlation', 'correlate']):
                numeric_cols = df.select_dtypes(include=['number']).columns
                if len(numeric_cols) > 1:
                    corr_matrix = df[numeric_cols].corr()
                    return f"""**Correlation Matrix:**

{corr_matrix.to_string()}

**Strong Correlations** (>0.7 or <-0.7):
{self.find_strong_correlations(corr_matrix)}"""
                else:
                    return "Need at least 2 numeric columns for correlation analysis."
            
            # Default overview
            else:
                return f"""**Data Overview:**

**Dataset Shape**: {df.shape[0]} rows × {df.shape[1]} columns
**Columns**: {list(df.columns)}
**Data Types**: {dict(df.dtypes)}
**Missing Values**: {df.isnull().sum().sum()} total

**Sample Data:**
{df.head(3).to_string()}

**Available Analysis:**
• "Show me the first 10 rows"
• "Calculate summary statistics"
• "Find missing values"
• "Show correlations"
• "Group by [column] and calculate averages"
"""
                
        except Exception as e:
            return f"Error analyzing data: {str(e)}"
    
    def find_strong_correlations(self, corr_matrix) -> str:
        """Find strong correlations in the matrix"""
        strong_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                corr_val = corr_matrix.iloc[i, j]
                if abs(corr_val) > 0.7:
                    col1 = corr_matrix.columns[i]
                    col2 = corr_matrix.columns[j]
                    strong_corr.append(f"• {col1} ↔ {col2}: {corr_val:.3f}")
        
        return "\n".join(strong_corr) if strong_corr else "No strong correlations found."
    
    def get_data_analysis_status(self) -> str:
        """Check data analysis capabilities"""
        status = "**Data Analysis Status**\n\n"
        
        try:
            import pandas
            status += "✅ Pandas library: Available\n"
        except ImportError:
            status += "❌ Pandas library: Not available\n"
        
        try:
            import numpy
            status += "✅ NumPy library: Available\n"
        except ImportError:
            status += "❌ NumPy library: Not available\n"
        
        status += "✅ CSV processing: Available\n"
        status += "✅ Statistical analysis: Available\n"
        status += "✅ Data exploration: Available\n"
        
        status += "\n🎉 Data analysis is ready to use!"
        
        return status
