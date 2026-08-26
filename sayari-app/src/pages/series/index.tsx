import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, BookOpen, GripVertical, ChevronRight } from 'lucide-react'
import { seriesApi } from '../../api'
import { useAuthStore } from '../../store/auth.store'
import { Button, Input, Textarea, Select, PageSpinner, EmptyState, Card } from '../../components/ui'
import { SeriesCard } from '../channel/index'
import { cn, timeAgo, formatCount, getErrorMessage } from '../../utils'
import type { Series, Post } from '../../types'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
//  SERIES DETAIL PAGE
// ─────────────────────────────────────────────

export function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['series', id],
    queryFn : () => seriesApi.get(id!).then(r => r.data.data.series),
    enabled : !!id,
  })

  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['series', id, 'chapters'],
    queryFn : () => seriesApi.getChapters(id!).then(r => r.data.data),
    enabled : !!id,
  })

  if (isLoading) return <PageSpinner />
  if (!data) return (
    <div className="text-center py-20">
      <p className="text-[#888]">Series not found</p>
      <Link to="/"><Button variant="ghost" className="mt-4">Go Home</Button></Link>
    </div>
  )

  const isOwner = user?._id === (typeof data.author === 'object' ? data.author._id : data.author)
  const statusColors: Record<string, string> = {
    ongoing: 'text-green-400 bg-green-400/10', completed: 'text-[#6C63FF] bg-[#6C63FF]/10',
    on_hiatus: 'text-yellow-400 bg-yellow-400/10', dropped: 'text-red-400 bg-red-400/10',
  }

  return (
    <div>
      <button onClick={() => history.back()} className="flex items-center gap-2 text-[#888] hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Cover + Info */}
      <div className="flex gap-4 mb-6">
        <div className="w-28 h-40 rounded-2xl overflow-hidden bg-[#242424] shrink-0">
          {data.cover?.url
            ? <img src={data.cover.url} alt={data.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white leading-snug">{data.title}</h1>
          <Link to={`/@${typeof data.author === 'object' ? data.author.username : ''}`}
            className="text-sm text-[#888] hover:text-[#6C63FF] transition-colors mt-1 block">
            by {typeof data.author === 'object' ? data.author.displayName : ''}
          </Link>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColors[data.completionStatus])}>
              {data.completionStatus.replace('_', ' ')}
            </span>
            {data.genre && (
              <span className="text-xs text-[#888] bg-[#242424] px-2 py-0.5 rounded-full capitalize">{data.genre}</span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-sm font-bold text-white">{data.publishedChapters}</p>
              <p className="text-[10px] text-[#888]">Chapters</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">{formatCount(data.stats.viewCount)}</p>
              <p className="text-[10px] text-[#888]">Views</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">{formatCount(data.stats.likeCount)}</p>
              <p className="text-[10px] text-[#888]">Likes</p>
            </div>
          </div>
        </div>
      </div>

      {data.description && (
        <p className="text-[#888] text-sm leading-relaxed mb-6">{data.description}</p>
      )}

      {data.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {data.tags.map(tag => (
            <Link key={tag} to={`/search?tag=${tag}`} className="text-xs text-[#6C63FF] hover:underline">#{tag}</Link>
          ))}
        </div>
      )}

      {/* Owner actions */}
      {isOwner && (
        <div className="flex gap-2 mb-6">
          <Link to={`/series/${id}/manage`}>
            <Button variant="outline" size="sm">Manage Series</Button>
          </Link>
        </div>
      )}

      {/* Chapters list */}
      <h2 className="text-base font-bold text-white mb-4">
        Chapters ({chaptersData?.chapters.length ?? 0})
      </h2>

      {chaptersLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#1A1A1A] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !chaptersData?.chapters.length ? (
        <EmptyState icon="📖" title="No chapters published yet" description="Check back soon!" />
      ) : (
        <div className="flex flex-col gap-2">
          {chaptersData.chapters.map((chapter, idx) => (
            <ChapterListItem key={chapter._id} chapter={chapter} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChapterListItem({ chapter, index }: { chapter: Post; index: number }) {
  return (
    <Link
      to={`/post/${chapter._id}`}
      className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors group"
    >
      <div className="w-8 h-8 bg-[#242424] rounded-lg flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-[#6C63FF]">{chapter.chapterNumber ?? index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {chapter.chapterTitle || chapter.title || `Chapter ${index + 1}`}
        </p>
        <p className="text-xs text-[#555] mt-0.5">{timeAgo(chapter.publishedAt || chapter.createdAt)}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#555] group-hover:text-[#6C63FF] transition-colors shrink-0" />
    </Link>
  )
}

// ─────────────────────────────────────────────
//  CREATE SERIES PAGE
// ─────────────────────────────────────────────

const seriesSchema = z.object({
  title             : z.string().min(2, 'Min 2 chars').max(200),
  description       : z.string().max(3000).optional(),
  type              : z.enum(['story', 'novel', 'poetry_collection', 'audiobook', 'audio_series', 'book']),
  language          : z.enum(['ur', 'hi', 'en', 'pa', 'mixed']),
  genre             : z.string().optional(),
  tags              : z.string().optional(),
  visibility        : z.enum(['public', 'private', 'followers_only']),
  estimatedChapters : z.coerce.number().min(1).max(1000).optional(),
})

type SeriesForm = z.infer<typeof seriesSchema>

export function CreateSeriesPage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SeriesForm>({
    resolver    : zodResolver(seriesSchema) as never,
    defaultValues: { type: 'story', language: 'hi', visibility: 'public' },
  })

  const onSubmit = async (data: SeriesForm) => {
    try {
      const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      const res  = await seriesApi.create({ ...data, tags })
      queryClient.invalidateQueries({ queryKey: ['mySeries'] })
      toast.success('Series created!')
      navigate(`/series/${res.data.data.series._id}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-[#888] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Create Series</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input label="Series Title" placeholder="Mohabbat Ki Kahani..." error={errors.title?.message} {...register('title')} />

        <Textarea label="Description" placeholder="Is series ke baare mein batayein..." rows={4} error={errors.description?.message} {...register('description')} />

        <Select
          label="Type"
          options={[
            { value: 'story',             label: '📖 Story'             },
            { value: 'novel',             label: '📚 Novel'             },
            { value: 'poetry_collection', label: '🌸 Poetry Collection' },
            { value: 'audiobook',         label: '🎧 Audiobook'         },
            { value: 'audio_series',      label: '🎙️ Audio Series'      },
            { value: 'book',              label: '📕 Book'              },
          ]}
          error={errors.type?.message}
          {...register('type')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Language"
            options={[
              { value: 'hi',    label: 'हिंदी'   },
              { value: 'ur',    label: 'اردو'    },
              { value: 'en',    label: 'English' },
              { value: 'pa',    label: 'ਪੰਜਾਬੀ' },
              { value: 'mixed', label: 'Mixed'   },
            ]}
            {...register('language')}
          />
          <Select
            label="Visibility"
            options={[
              { value: 'public',         label: '🌐 Public'         },
              { value: 'private',        label: '🔒 Private'        },
              { value: 'followers_only', label: '👥 Followers Only' },
            ]}
            {...register('visibility')}
          />
        </div>

        <Select
          label="Genre"
          options={[
            { value: '',           label: 'Select genre'  },
            { value: 'romance',    label: '💕 Romance'    },
            { value: 'horror',     label: '👻 Horror'     },
            { value: 'comedy',     label: '😄 Comedy'     },
            { value: 'thriller',   label: '😱 Thriller'   },
            { value: 'drama',      label: '🎭 Drama'      },
            { value: 'religious',  label: '🕌 Religious'  },
            { value: 'historical', label: '🏛️ Historical' },
            { value: 'fantasy',    label: '🧙 Fantasy'    },
            { value: 'biography',  label: '👤 Biography'  },
            { value: 'motivational',label:'💪 Motivational'},
          ]}
          {...register('genre')}
        />

        <Input
          label="Tags (comma separated)"
          placeholder="mohabbat, dard, kahani"
          {...register('tags')}
        />

        <Input
          label="Estimated Chapters (optional)"
          type="number"
          placeholder="10"
          error={errors.estimatedChapters?.message}
          {...register('estimatedChapters')}
        />

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={isSubmitting} className="flex-1" icon={<Plus className="w-4 h-4" />}>
            Create Series
          </Button>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────
//  MY SERIES LIST (for dashboard)
// ─────────────────────────────────────────────

export function MySeriesPage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['mySeries'],
    queryFn : () => seriesApi.list({ limit: 50 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => seriesApi.delete(id),
    onSuccess  : () => {
      queryClient.invalidateQueries({ queryKey: ['mySeries'] })
      toast.success('Series deleted')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  const series = data?.series ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">My Series</h1>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/series/create')}>
          New Series
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[2/3] bg-[#1A1A1A] rounded-2xl animate-pulse" />)}
        </div>
      ) : !series.length ? (
        <EmptyState
          icon="📚"
          title="No series yet"
          description="Create your first series to organise your stories"
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/series/create')}>Create Series</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {series.map(s => <SeriesCard key={s._id} series={s} />)}
        </div>
      )}
    </div>
  )
}
