class StoryPresenter {
  constructor(model, view, token) {
    this.model = model;
    this.view = view;
    this.token = token;
  }

  async loadStories() {
    try {
        const stories = await this.model.fetchStories(this.token);

        const validStories = stories.filter(story => story.lat !== null && story.lon !== null);
        
        console.log('📌 Data cerita setelah difilter:', validStories);

        this.view.renderStories(validStories);
    } catch (error) {
        console.error('❌ Gagal memuat cerita:', error);
        this.view.renderError('Gagal memuat cerita. Silakan coba lagi.');
    }
}

}

export default StoryPresenter;
