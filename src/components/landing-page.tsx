{/* Featured Exams Section */}
<section className="bg-slate-50 py-20"> {/* နောက်ခံကို မီးခိုးနုရောင် ပြောင်းထားပါတယ် */}
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-slate-900">Featured Exams</h2>
            <p className="mt-4 text-lg text-slate-600">Challenge yourself with our most popular quizzes.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockQuizzes.slice(0,3).map((quiz, index) => {
                const status = getQuizStatus(quiz);
                const quizImage = getQuizImage(quiz.id);
                return (
                <Card key={quiz.id} className="group overflow-hidden bg-white border border-slate-200 transition-all hover:shadow-2xl shadow-md animate-in fade-in zoom-in-95 duration-1000" style={{animationDelay: `${200 * index}ms`}}>
                    <CardContent className="p-0">
                        <div className="relative h-48 w-full">
                            <Image src={quizImage.imageUrl} alt={quiz.name} fill style={{objectFit: 'cover'}} className="transition-transform group-hover:scale-105" />
                            <div className="absolute top-3 right-3">
                                <Badge variant={status.variant} className={cn("px-3 py-1 font-bold", status.variant === 'live' ? "bg-green-500 text-white shadow-lg" : "bg-slate-500 text-white")}>
                                    {status.text}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider">{quiz.subject}</p>
                            {/* စာသားအရောင်ကို text-slate-900 (အမည်းရောင်) ပြောင်းထားပါတယ် */}
                            <h3 className="text-xl font-bold mt-2 h-14 line-clamp-2 text-slate-900 leading-tight">
                                {quiz.name}
                            </h3>
                            <div className="flex items-center justify-between text-sm text-slate-600 mt-4 font-medium border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span>{quiz.timerInMinutes} min</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Activity className="h-4 w-4 text-primary" />
                                    <span>{countQuestions(quiz)} Questions</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-5 pt-0">
                        <Button className="w-full bg-primary text-white hover:bg-primary/90 font-bold py-6 text-lg rounded-xl">
                            Enroll Now
                        </Button>
                    </div>
                </Card>
            )})}
        </div>
    </div>
</section>
