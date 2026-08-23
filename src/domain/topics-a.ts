/** Life-topic library, part 1 of 4 (topics 1–25): identity, daily life, social foundations. */

export type TopicCategory =
  | "personal" | "daily" | "social" | "health" | "culture" | "education"
  | "career" | "workplace" | "business" | "finance" | "technology"
  | "media" | "thinking" | "society" | "global" | "philosophy" | "future";

export interface LadderRung { level: string; example: string }

export interface LifeTopic {
  n: number;
  id: string;
  title: string;
  category: TopicCategory;
  ladder: LadderRung[];
}

const t = (n: number, id: string, title: string, category: TopicCategory, ladder: Array<[string, string]>): LifeTopic => ({
  n, id, title, category,
  ladder: ladder.map(([level, example]) => ({ level, example })),
});

export const TOPICS_A: LifeTopic[] = [
  t(1, "meeting-people", "Meeting People & Introducing Yourself", "social", [
    ["Pre-A1", "Hello! I'm Sara. Nice to meet you."],
    ["A2", "Let me introduce you to my colleague Kareem."],
    ["B1", "How do you two know each other, exactly?"],
    ["C1", "We were formally introduced at a conference, but we'd never actually worked together."],
  ]),
  t(2, "family-relatives", "Family & Relatives", "personal", [
    ["Pre-A1", "This is my brother. He is six."],
    ["A2", "My cousin is getting married next month."],
    ["B1", "I take after my mother — we're both quite stubborn."],
    ["B2", "Extended families often end up sharing childcare responsibilities."],
  ]),
  t(3, "home-living", "Home & Where You Live", "daily", [
    ["Pre-A1", "My house is small. I like it."],
    ["A2", "I live in a flat on the third floor, near the station."],
    ["B1", "We're thinking of moving somewhere with more natural light."],
    ["C1", "There's a real trade-off between space, commute and affordability."],
  ]),
  t(4, "daily-routines", "Daily Routines & Habits", "daily", [
    ["Pre-A1", "I wake up at seven every day."],
    ["A2", "I usually check my phone before I even get out of bed."],
    ["B1", "I've started walking to work instead of taking the bus."],
    ["B2", "My evenings tend to disappear into admin unless I plan around it."],
  ]),
  t(5, "time-schedules", "Time, Dates & Schedules", "daily", [
    ["Pre-A1", "The class is at nine o'clock."],
    ["A2", "Can we move our meeting to Thursday afternoon?"],
    ["B1", "I'll need to check my calendar — I might be double-booked."],
    ["B2", "Could we find a slot that works across time zones?"],
  ]),
  t(6, "food-meals", "Food, Meals & Eating Habits", "daily", [
    ["Pre-A1", "I like rice. I don't like fish."],
    ["A2", "I'm trying to eat less sugar these days."],
    ["B1", "We mostly cook at home during the week and eat out on Fridays."],
    ["B2", "There's growing awareness about where our food actually comes from."],
  ]),
  t(7, "shopping-everyday", "Shopping for Everyday Things", "daily", [
    ["Pre-A1", "How much is this water?"],
    ["A2", "Excuse me, do you have this in a bigger size?"],
    ["B1", "I'll take it — though I saw it cheaper online, honestly."],
    ["B2", "Consumer habits have shifted dramatically towards online marketplaces."],
  ]),
  t(8, "clothes-style", "Clothes, Appearance & Personal Style", "social", [
    ["Pre-A1", "I like your hat!"],
    ["A2", "This jacket is too formal for the party."],
    ["B1", "I tend to dress smartly for meetings but casually otherwise."],
    ["B2", "First impressions are unfairly shaped by what people wear."],
  ]),
  t(9, "weather-seasons", "Weather & Seasons", "daily", [
    ["Pre-A1", "It's cold today. Take a coat."],
    ["A2", "It's been raining all week — quite unusual for May."],
    ["B1", "Summers here are getting noticeably hotter than they used to be."],
    ["B2", "Extreme weather events are becoming harder to ignore."],
  ]),
  t(10, "neighborhood-community", "Your Neighborhood & Community", "social", [
    ["Pre-A1", "The shop is near my house."],
    ["A2", "Our neighbours are friendly — they always say hello."],
    ["B1", "There's a community garden two streets away that anyone can use."],
    ["B2", "Local businesses give a neighbourhood its character, in my view."],
  ]),
  t(11, "transportation", "Getting Around & Transportation", "daily", [
    ["Pre-A1", "The bus is late again."],
    ["A2", "Does this train stop at Central Station?"],
    ["B1", "Cycling is faster than driving in the city centre at rush hour."],
    ["B2", "Cities need to prioritise public transport over private cars."],
  ]),
  t(12, "travel-holidays", "Travel & Holidays", "culture", [
    ["A1", "I want to go to the beach."],
    ["A2", "We booked a cheap flight and stayed in a hostel."],
    ["B1", "Travelling off-season is cheaper and far less crowded."],
    ["C1", "Mass tourism brings money but quietly erodes the very character people come for."],
  ]),
  t(13, "hotels-accommodation", "Hotels & Accommodation", "culture", [
    ["A1", "I have a reservation. My name is Omar."],
    ["A2", "Could I check out a bit later tomorrow?"],
    ["B1", "The room wasn't cleaned — could you send someone up?"],
    ["B2", "I'd expect a partial refund given the inconvenience, frankly."],
  ]),
  t(14, "restaurants-ordering", "Restaurants, Cafés & Ordering Food", "social", [
    ["A1", "A coffee and a cake, please."],
    ["A2", "Is this dish very spicy? I'm not great with chilli."],
    ["B1", "Could we get a table for four — ideally away from the kitchen?"],
    ["B2", "The service was slow, but the food almost made up for it."],
  ]),
  t(15, "help-directions", "Asking for Help & Giving Directions", "daily", [
    ["A1", "Excuse me, where is the bank?"],
    ["A2", "Go straight on, then turn left at the lights."],
    ["B1", "Sorry to bother you — could you point me towards platform two?"],
    ["B2", "You're best off taking the side street; the main road is packed."],
  ]),
  t(16, "friends-socializing", "Making Friends & Socializing", "social", [
    ["A1", "Do you want to play football?"],
    ["A2", "We should hang out sometime — are you free this weekend?"],
    ["B1", "It takes me a while to warm up in big groups, to be honest."],
    ["B2", "Adult friendships mostly survive on small, consistent gestures."],
  ]),
  t(17, "invitations-plans", "Invitations, Plans & Events", "social", [
    ["A1", "Can you come to my party?"],
    ["A2", "Would you fancy grabbing a coffee after class?"],
    ["B1", "Count us in — though we might be half an hour late."],
    ["B2", "Let's pencil it in and confirm closer to the day."],
  ]),
  t(18, "hobbies-free-time", "Hobbies, Interests & Free Time", "personal", [
    ["A1", "I like music and photos."],
    ["A2", "I've recently taken up photography — I'm still bad at it."],
    ["B1", "I find woodworking strangely relaxing after a screen-heavy week."],
    ["B2", "Hobbies keep pulling me back; chores never do — that tells you something."],
  ]),
  t(19, "entertainment-music", "Entertainment, Movies & Music", "culture", [
    ["A1", "I love this song!"],
    ["A2", "Shall we watch a film tonight — something funny?"],
    ["B1", "The plot was thin, but the soundtrack carried it."],
    ["B2", "Streaming has changed what gets made — everything is designed to be bingeable."],
  ]),
  t(20, "sports-activities", "Sports & Physical Activities", "health", [
    ["A1", "I play tennis on Fridays."],
    ["A2", "I've joined a gym, but I barely go, if I'm honest."],
    ["B1", "Training with other people keeps me accountable."],
    ["B2", "Exercise is the closest thing we have to a miracle drug, apparently."],
  ]),
  t(21, "health-wellbeing", "Health, Wellbeing & Healthy Living", "health", [
    ["A1", "I drink water every day."],
    ["A2", "I'm trying to sleep eight hours and walk more."],
    ["B1", "Small habits — stretching, early nights — add up surprisingly fast."],
    ["B2", "Prevention rarely feels urgent until it's too late."],
  ]),
  t(22, "doctor-healthcare", "Doctor, Dentist & Healthcare Situations", "health", [
    ["A1", "My tooth hurts."],
    ["A2", "I've had a sore throat since Monday."],
    ["B1", "The pain comes and goes — worse in the mornings, mainly."],
    ["B2", "I'd like a second opinion before starting any long-term medication."],
  ]),
  t(23, "emotions-feelings", "Emotions, Feelings & Mental States", "personal", [
    ["A1", "I am happy. I am tired."],
    ["A2", "I felt nervous before the exam, but fine afterwards."],
    ["B1", "I've been feeling a bit flat lately — probably just winter."],
    ["B2", "Naming an emotion precisely already loosens its grip, oddly enough."],
  ]),
  t(24, "personality-character", "Personality & Character", "personal", [
    ["A1", "He is kind and funny."],
    ["A2", "She's outgoing, but her sister is quite shy."],
    ["B1", "I'd say I'm organised to a fault — I over-plan everything."],
    ["B2", "We praise confidence, yet quietly punish the blunt honesty that often comes with it."],
  ]),
  t(25, "relationships-communication", "Relationships & Communication", "social", [
    ["A2", "I talk to my mum every Sunday."],
    ["B1", "We clear the air quickly rather than letting things fester."],
    ["B2", "Most conflicts are about tone, not substance, once you dig."],
    ["C1", "Intimacy is largely built from micro-attention, not grand gestures."],
  ]),
];
