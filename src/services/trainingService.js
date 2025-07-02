import { supabase } from '../lib/supabase';

// Training Session Management
export const trainingService = {
  // Test Supabase connection
  async testConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        return { success: false, error };
      }
      
      console.log('✅ Supabase connection test successful');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Supabase connection test error:', error);
      return { success: false, error };
    }
  },
  // Create a new training session
  async createSession(userId) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            user_id: userId,
            session_date: new Date().toISOString(),
            total_attempts: 0,
            average_score: 0,
            best_score: 0,
            scenarios_completed: 0,
            session_duration_minutes: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating session:', error);
      return { data: null, error };
    }
  },

  // Update session with new stats
  async updateSession(sessionId, stats) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          total_attempts: stats.totalAttempts,
          average_score: stats.averageScore,
          best_score: stats.bestScore,
          scenarios_completed: stats.scenariosCompleted,
          session_duration_minutes: stats.durationMinutes
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating session:', error);
      return { data: null, error };
    }
  },

  // Save an individual attempt
  async saveAttempt(attemptData) {
    try {
      console.log('🔍 trainingService.saveAttempt called with:', {
        sessionId: attemptData.sessionId,
        userId: attemptData.userId,
        scenarioId: attemptData.scenarioId,
        score: attemptData.score
      });
      
      const { data, error } = await supabase
        .from('attempts')
        .insert([{
          session_id: attemptData.sessionId,
          user_id: attemptData.userId,
          scenario_id: attemptData.scenarioId,
          scenario_type: attemptData.scenarioType,
          atc_call: attemptData.atcCall,
          user_response: attemptData.userResponse,
          expected_keywords: attemptData.expectedKeywords,
          score: attemptData.score,
          missing_elements: attemptData.missingElements || [],
          present_elements: attemptData.presentElements || [],
          attempt_time: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error saving attempt:', error);
        throw error;
      }
      
      console.log('✅ Attempt saved successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error saving attempt:', error);
      return { data: null, error };
    }
  },

  // Get user's recent sessions
  async getUserSessions(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return { data: null, error };
    }
  },

  // Get attempts for a specific session
  async getSessionAttempts(sessionId) {
    try {
      const { data, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('session_id', sessionId)
        .order('attempt_time', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching session attempts:', error);
      return { data: null, error };
    }
  },

  // Get user statistics
  async getUserStats(userId) {
    try {
      // Get overall profile stats
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get recent attempts for detailed analysis
      const { data: recentAttempts, error: attemptsError } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', userId)
        .order('attempt_time', { ascending: false })
        .limit(100);

      if (attemptsError) throw attemptsError;

      // Calculate stats by scenario type
      const statsByType = {};
      recentAttempts?.forEach(attempt => {
        if (!statsByType[attempt.scenario_type]) {
          statsByType[attempt.scenario_type] = {
            totalAttempts: 0,
            totalScore: 0,
            bestScore: 0,
            averageScore: 0
          };
        }
        
        const typeStats = statsByType[attempt.scenario_type];
        typeStats.totalAttempts++;
        typeStats.totalScore += attempt.score;
        typeStats.bestScore = Math.max(typeStats.bestScore, attempt.score);
        typeStats.averageScore = Math.round(typeStats.totalScore / typeStats.totalAttempts);
      });

      return { 
        data: {
          profile,
          recentAttempts,
          statsByType
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { data: null, error };
    }
  },

  // Update user profile stats (called after each session)
  async updateProfileStats(userId) {
    try {
      // Calculate new stats from all user attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('attempts')
        .select('score')
        .eq('user_id', userId);

      if (attemptsError) throw attemptsError;

      if (attempts && attempts.length > 0) {
        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = Math.round(totalScore / totalAttempts);
        const bestScore = Math.max(...attempts.map(a => a.score));

        // Get session count
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', userId);

        if (sessionsError) throw sessionsError;

        const totalSessions = sessions?.length || 0;

        // Update profile
        const { data, error } = await supabase
          .from('profiles')
          .update({
            total_sessions: totalSessions,
            total_attempts: totalAttempts,
            average_score: averageScore,
            best_score: bestScore
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Error updating profile stats:', error);
      return { data: null, error };
    }
  }
}; 