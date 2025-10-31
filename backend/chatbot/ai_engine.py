"""
AI Engine for Civic Platform Chatbot
Supports both OpenAI (paid) and Google Gemini (free)
"""
import os
import json
import time
from typing import Dict, List, Optional, Tuple
from django.conf import settings


class CivicChatbotAI:
    """
    AI-powered chatbot for civic platform
    Supports OpenAI GPT and Google Gemini
    """
    
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        
        # Determine which AI service to use
        if self.openai_key:
            self.ai_service = 'openai'
            self._init_openai()
        elif self.gemini_key:
            self.ai_service = 'gemini'
            self._init_gemini()
        else:
            self.ai_service = 'fallback'
            print("[!] No AI API key found. Using fallback responses.")
    
    def _init_openai(self):
        """Initialize OpenAI client"""
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=self.openai_key)
            self.model = "gpt-3.5-turbo"  # or "gpt-4" for better quality
            print("[OK] OpenAI initialized")
        except ImportError:
            print("[!] OpenAI package not installed. Run: pip install openai")
            self.ai_service = 'fallback'
        except Exception as e:
            print(f"[!] OpenAI initialization error: {e}")
            self.ai_service = 'fallback'
    
    def _init_gemini(self):
        """Initialize Google Gemini client"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            self.client = genai.GenerativeModel('gemini-pro')
            print("[OK] Google Gemini initialized")
        except ImportError:
            print("[!] Google GenAI package not installed. Run: pip install google-generativeai")
            self.ai_service = 'fallback'
        except Exception as e:
            print(f"[!] Gemini initialization error: {e}")
            self.ai_service = 'fallback'
    
    def get_system_context(self, user_data: Optional[Dict] = None) -> str:
        """
        Build system context about the civic platform
        """
        context = """You are a helpful AI assistant for a Civic Engagement Platform. 
        
Your purpose is to help citizens:
- Report community issues (potholes, broken lights, pollution, etc.)
- Participate in community forums and discussions
- Attend and RSVP to community events
- View government transparency data (budgets, projects, spending)
- Engage in civic activities and earn rewards
- Track their civic engagement level and community credits

Platform Features:
1. **Issue Reporting**: Citizens report problems with photos, location, and description
2. **Community Forum**: Discussions, polls, and petitions for community engagement
3. **Events**: Community events, volunteer opportunities, RSVP system
4. **Transparency Dashboard**: Public spending, government projects, performance metrics
5. **Civic Rewards**: Gamification system where users earn points and credits for participation
6. **Maps**: Interactive maps showing issues and events by location

Civic Levels System:
- Level 1: New Citizen (0 points) - Basic access + 10 credits/month
- Level 2: Active Neighbor (100 points) - Priority event registration + 25 credits/month
- Level 3: Community Helper (300 points) - Priority issue response + 50 credits/month
- Level 4: Civic Champion (750 points) - Direct messaging to officials + 100 credits/month
- Level 5: Local Leader (1500 points) - Urban planning consultation + 200 credits/month
- Level 6: City Ambassador (3000 points) - All benefits + 500 credits/month
- Level 7: Urban Hero (5000 points) - Elite status + 1000 credits/month

Earning Points:
- Report issue: 10 points
- Issue resolved: 50 points
- Attend event: 20 points
- Forum post: 15 points
- Vote in poll: 5 points
- Sign petition: 10 points

Community Credits Can Be Redeemed For:
- Parking fee waiver (50 credits)
- Permit priority processing (100 credits)
- Recreation center pass (150 credits)
- Public transit credit (75 credits)
- Event ticket (25 credits)
- Urban planning consultation (500 credits)

User Roles:
- Citizens: Can report issues, participate in forums, RSVP events
- Officials: Can respond to issues, update projects, create events
- Admins: Full platform management

Be friendly, concise, and helpful. Provide step-by-step guidance when needed.
If asked about reporting an issue, guide them through: Go to Dashboard > Issues > Create New Issue.
If asked about events, direct them to: Dashboard > Events.
If asked about their level/rewards, direct them to: Dashboard > Profile or Gamification page.

Remember: You're helping build a better community through civic engagement!"""

        if user_data:
            user_info = f"""

Current User Context:
- Name: {user_data.get('name', 'User')}
- Role: {user_data.get('role', 'citizen').title()}
- Civic Level: {user_data.get('level', 1)} - {user_data.get('level_name', 'New Citizen')}
- Total Points: {user_data.get('points', 0)}
- Community Credits: {user_data.get('credits', 0)}"""
            context += user_info
        
        return context
    
    def generate_response(
        self, 
        user_message: str, 
        conversation_history: List[Dict] = None,
        user_data: Optional[Dict] = None
    ) -> Tuple[str, str, float, int]:
        """
        Generate AI response
        Returns: (response_text, intent, confidence, response_time_ms)
        """
        start_time = time.time()
        
        # Detect intent first
        intent = self._detect_intent(user_message)
        
        # Generate response based on AI service
        if self.ai_service == 'openai':
            response = self._generate_openai_response(user_message, conversation_history, user_data)
        elif self.ai_service == 'gemini':
            response = self._generate_gemini_response(user_message, conversation_history, user_data)
        else:
            response = self._generate_fallback_response(user_message, intent)
        
        response_time_ms = int((time.time() - start_time) * 1000)
        confidence = 0.9 if self.ai_service != 'fallback' else 0.5
        
        return response, intent, confidence, response_time_ms
    
    def _detect_intent(self, message: str) -> str:
        """Detect user intent from message"""
        message_lower = message.lower()
        
        # Intent keywords mapping
        intent_keywords = {
            'report_issue': ['report', 'issue', 'problem', 'pothole', 'broken', 'fix', 'damage'],
            'find_events': ['event', 'volunteer', 'activity', 'rsvp', 'attend', 'happening'],
            'forum_help': ['forum', 'discussion', 'poll', 'petition', 'post', 'comment'],
            'transparency': ['budget', 'spending', 'project', 'transparency', 'money', 'government'],
            'rewards': ['points', 'level', 'credit', 'reward', 'badge', 'achievement', 'leaderboard'],
            'account': ['profile', 'account', 'password', 'email', 'settings'],
            'how_to': ['how', 'what', 'where', 'when', 'guide', 'help', 'tutorial'],
        }
        
        for intent, keywords in intent_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return intent
        
        return 'general'
    
    def _generate_openai_response(
        self, 
        user_message: str, 
        conversation_history: List[Dict],
        user_data: Optional[Dict]
    ) -> str:
        """Generate response using OpenAI GPT"""
        try:
            # Build messages for OpenAI
            messages = [
                {"role": "system", "content": self.get_system_context(user_data)}
            ]
            
            # Add conversation history
            if conversation_history:
                for msg in conversation_history[-10:]:  # Last 10 messages for context
                    role = "user" if msg.get('sender') == 'user' else "assistant"
                    messages.append({"role": role, "content": msg.get('message', '')})
            
            # Add current message
            messages.append({"role": "user", "content": user_message})
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"[ERROR] OpenAI Error: {str(e)}")
            return self._generate_fallback_response(user_message, self._detect_intent(user_message))
    
    def _generate_gemini_response(
        self, 
        user_message: str, 
        conversation_history: List[Dict],
        user_data: Optional[Dict]
    ) -> str:
        """Generate response using Google Gemini"""
        try:
            # Build conversation context
            context = self.get_system_context(user_data)
            
            # Build full prompt with history
            prompt = context + "\n\nConversation:\n"
            
            if conversation_history:
                for msg in conversation_history[-10:]:
                    sender = "User" if msg.get('sender') == 'user' else "Assistant"
                    prompt += f"{sender}: {msg.get('message', '')}\n"
            
            prompt += f"User: {user_message}\nAssistant:"
            
            # Call Gemini API
            response = self.client.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"[ERROR] Gemini Error: {str(e)}")
            return self._generate_fallback_response(user_message, self._detect_intent(user_message))
    
    def _generate_fallback_response(self, message: str, intent: str) -> str:
        """Generate fallback response when no AI API is available"""
        
        fallback_responses = {
            'report_issue': """To report a community issue:
1. Go to **Dashboard** > **Issues**
2. Click **"Create New Issue"**
3. Fill in:
   - Title and description
   - Category (infrastructure, safety, etc.)
   - Location (use map or type address)
   - Upload photos (optional)
4. Submit!

You'll earn **10 points** for reporting an issue!

Officials will review and respond within 48 hours.""",
            
            'find_events': """To find community events:
1. Go to **Dashboard** > **Events**
2. Browse upcoming events or use filters
3. Click on an event to see details
4. Click **RSVP** to register

You'll earn **20 points** for attending events!

Events include: cleanups, town halls, workshops, and volunteer opportunities.""",
            
            'forum_help': """To participate in community forums:
1. Go to **Dashboard** > **Forum**
2. Browse discussions or create a new post
3. You can:
   - Start discussions
   - Create polls
   - Launch petitions
   - Comment and vote

Earn points for participation:
- Forum post: **15 points**
- Comment: **5 points**
- Vote in poll: **5 points**""",
            
            'transparency': """To view government transparency data:
1. Go to **Dashboard** > **Transparency**
2. Explore:
   - Public spending by department
   - Active government projects
   - Budget allocations
   - Performance metrics
   - Public documents

All data is updated monthly and verified for accuracy.""",
            
            'rewards': """**Civic Rewards System**

Earn points for civic engagement:
- Report issue: 10 points
- Issue resolved: 50 points
- Attend event: 20 points
- Forum post: 15 points

Level up to unlock benefits:
- Level 3: Priority issue response
- Level 4: Direct message officials
- Level 5: Urban planning consultation

Redeem community credits for:
- Parking waivers (50 credits)
- Recreation passes (150 credits)
- Transit credits (75 credits)

Check your progress: **Dashboard** > **Profile**""",
            
            'account': """To manage your account:
1. Go to **Dashboard** > **Settings**
2. You can:
   - Update profile information
   - Change password
   - Set notification preferences
   - Manage privacy settings
   - View your civic level and points

Need help with something specific? Let me know!""",
            
            'general': """Hi! I'm your Civic Assistant.

I can help you with:
- Reporting community issues
- Finding events and volunteering
- Forum discussions and polls
- Government transparency data
- Understanding the rewards system
- Account and settings

What would you like to know about?"""
        }
        
        return fallback_responses.get(intent, fallback_responses['general'])
    
    def get_quick_replies(self, intent: str) -> List[Dict]:
        """Generate quick reply buttons based on intent"""
        
        quick_replies_map = {
            'general': [
                {'text': 'Report Issue', 'action': 'report_issue'},
                {'text': 'Find Events', 'action': 'find_events'},
                {'text': 'Forum', 'action': 'forum_help'},
                {'text': 'My Rewards', 'action': 'rewards'},
            ],
            'report_issue': [
                {'text': 'Go to Issues Page', 'action': 'navigate', 'url': '/dashboard/issues/new'},
                {'text': 'More Help', 'action': 'general'},
            ],
            'find_events': [
                {'text': 'Browse Events', 'action': 'navigate', 'url': '/dashboard/events'},
                {'text': 'Create Event', 'action': 'navigate', 'url': '/dashboard/events/create'},
            ],
            'forum_help': [
                {'text': 'Go to Forum', 'action': 'navigate', 'url': '/dashboard/forum'},
                {'text': 'More Tips', 'action': 'general'},
            ],
            'transparency': [
                {'text': 'View Transparency', 'action': 'navigate', 'url': '/dashboard/transparency'},
            ],
            'rewards': [
                {'text': 'My Profile', 'action': 'navigate', 'url': '/dashboard/settings'},
                {'text': 'Leaderboard', 'action': 'leaderboard'},
            ],
        }
        
        return quick_replies_map.get(intent, quick_replies_map['general'])


# Singleton instance
_chatbot_ai = None

def get_chatbot_ai() -> CivicChatbotAI:
    """Get chatbot AI instance (singleton)"""
    global _chatbot_ai
    if _chatbot_ai is None:
        _chatbot_ai = CivicChatbotAI()
    return _chatbot_ai

